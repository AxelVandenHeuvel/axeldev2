/**
 * Bakes Natural Earth country outlines into src/data/europeMap.js.
 *
 *   npm run map:build
 *
 * Deliberately NOT part of `npm run build` -- CI should never depend on
 * fetching a 3MB file from GitHub. Run this by hand when the map needs
 * regenerating and commit the output.
 *
 * Pipeline: fetch -> clip to bbox -> project -> Douglas-Peucker -> drop
 * slivers -> relative-encode.
 *
 * Two things here are load-bearing and easy to get wrong:
 *
 *   1. Simplification runs on PROJECTED coordinates, not lon/lat. A tolerance
 *      in degrees means something different at Iceland's latitude than at
 *      Naples', so simplifying in degrees over-flattens the north.
 *
 *   2. Rings are clipped to the bbox rather than filtered by it. Russia's
 *      main ring runs to 180E, so merely *including* it would drag all of
 *      Siberia into a map of Europe.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { project, R } from '../src/lib/projection.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CACHE = resolve(ROOT, 'node_modules/.cache/europe-map')
const OUT = resolve(ROOT, 'src/data/europeMap.js')

const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson'

/** Fine layer: Europe. 50m, because Slovenia at 110m is an 18-point blob. */
const FINE = {
  file: 'ne_50m_admin_0_countries.geojson',
  bbox: [-33, 33, 46, 73], // [lonMin, latMin, lonMax, latMax]
  tolerance: 2, // world units; ~0.87km at 47N. Sets MIN_W in the camera.
  minRing: 10, // drop rings under this many points -- rocks and islets
}

/** Coarse layer: N. America + Greenland, only ever seen in the Atlantic opening. */
const COARSE = {
  file: 'ne_110m_admin_0_countries.geojson',
  bbox: [-170, 20, -10, 75],
  tolerance: 20,
  minRing: 8,
}

async function fetchGeoJSON(file) {
  const cached = resolve(CACHE, file)
  if (existsSync(cached)) {
    process.stdout.write(`  cache hit  ${file}\n`)
    return JSON.parse(await readFile(cached, 'utf8'))
  }
  process.stdout.write(`  fetching   ${file} ...`)
  const res = await fetch(`${NE}/${file}`)
  if (!res.ok) throw new Error(`fetch ${file} failed: ${res.status} ${res.statusText}`)
  const text = await res.text()
  process.stdout.write(` ${(text.length / 1048576).toFixed(2)} MB\n`)
  await mkdir(CACHE, { recursive: true })
  await writeFile(cached, text)
  return JSON.parse(text)
}

/**
 * Sutherland-Hodgman polygon clip against an axis-aligned rectangle.
 * Runs in lon/lat space, before projection. Keeps rings closed, which a
 * naive point filter would not.
 */
function clipToBBox(ring, [lonMin, latMin, lonMax, latMax]) {
  const edges = [
    { inside: (p) => p[0] >= lonMin, cut: (a, b) => cutX(a, b, lonMin) },
    { inside: (p) => p[0] <= lonMax, cut: (a, b) => cutX(a, b, lonMax) },
    { inside: (p) => p[1] >= latMin, cut: (a, b) => cutY(a, b, latMin) },
    { inside: (p) => p[1] <= latMax, cut: (a, b) => cutY(a, b, latMax) },
  ]

  function cutX(a, b, x) {
    const t = (x - a[0]) / (b[0] - a[0])
    return [x, a[1] + t * (b[1] - a[1])]
  }
  function cutY(a, b, y) {
    const t = (y - a[1]) / (b[1] - a[1])
    return [a[0] + t * (b[0] - a[0]), y]
  }

  let out = ring
  for (const edge of edges) {
    if (out.length === 0) return []
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      const curIn = edge.inside(cur)
      const prevIn = edge.inside(prev)
      if (curIn) {
        if (!prevIn) out.push(edge.cut(prev, cur))
        out.push(cur)
      } else if (prevIn) {
        out.push(edge.cut(prev, cur))
      }
    }
  }
  return out
}

/** Douglas-Peucker. Iterative so a pathological ring can't blow the stack. */
function simplify(points, tolerance) {
  if (points.length <= 2) return points
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1

  const stack = [[0, points.length - 1]]
  const tol2 = tolerance * tolerance

  while (stack.length) {
    const [first, last] = stack.pop()
    if (last - first < 2) continue

    const [ax, ay] = points[first]
    const [bx, by] = points[last]
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy

    let maxDist = -1
    let maxIdx = -1
    for (let i = first + 1; i < last; i++) {
      const [px, py] = points[i]
      let d2
      if (len2 === 0) {
        d2 = (px - ax) ** 2 + (py - ay) ** 2
      } else {
        // Perpendicular distance to the segment, squared.
        let t = ((px - ax) * dx + (py - ay) * dy) / len2
        t = t < 0 ? 0 : t > 1 ? 1 : t
        d2 = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2
      }
      if (d2 > maxDist) {
        maxDist = d2
        maxIdx = i
      }
    }

    if (maxDist > tol2) {
      keep[maxIdx] = 1
      stack.push([first, maxIdx], [maxIdx, last])
    }
  }

  const out = []
  for (let i = 0; i < points.length; i++) if (keep[i]) out.push(points[i])
  return out
}

/**
 * Relative SVG path encoding: "M x y l dx dy dx dy ... z".
 *
 * Worth ~44% over absolute "M x y L x y L x y", because after integer
 * rounding the deltas are mostly 1-3 characters where absolute pairs are ~11.
 * There's no runtime decode cost -- the browser's path parser handles `l`
 * natively.
 */
function toRelativePath(points) {
  if (points.length < 3) return null
  let [px, py] = points[0]
  let d = `M${px} ${py}l`
  const parts = []
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]
    const dx = x - px
    const dy = y - py
    if (dx === 0 && dy === 0) continue // collinear duplicates after rounding
    parts.push(`${dx} ${dy}`)
    px = x
    py = y
  }
  if (parts.length < 2) return null
  d += parts.join(' ')
  return `${d}z`
}

function eachRing(geometry, fn) {
  if (!geometry) return
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(fn)
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach((poly) => poly.forEach(fn))
  }
}

function buildLayer(geojson, { bbox, tolerance, minRing }) {
  const paths = []
  let rawPoints = 0
  let keptPoints = 0

  for (const feature of geojson.features) {
    eachRing(feature.geometry, (ring) => {
      rawPoints += ring.length

      const clipped = clipToBBox(ring, bbox)
      if (clipped.length < 3) return

      // Project, then round. Rounding before simplify means DP works on the
      // coordinates that actually ship, so the tolerance is honest.
      const projected = clipped.map(([lon, lat]) => {
        const [x, y] = project(lon, lat)
        return [Math.round(x), Math.round(y)]
      })

      const simplified = simplify(projected, tolerance)
      if (simplified.length < minRing) return

      const d = toRelativePath(simplified)
      if (!d) return

      keptPoints += simplified.length
      paths.push(d)
    })
  }

  return { paths, rawPoints, keptPoints }
}

async function main() {
  process.stdout.write('Building Europe map data\n\n')

  const [fineGeo, coarseGeo] = await Promise.all([
    fetchGeoJSON(FINE.file),
    fetchGeoJSON(COARSE.file),
  ])

  process.stdout.write('\n')
  const fine = buildLayer(fineGeo, FINE)
  const coarse = buildLayer(coarseGeo, COARSE)

  const body = `/**
 * GENERATED FILE -- do not edit by hand.
 * Run \`npm run map:build\` to regenerate. Source: Natural Earth (public domain).
 *
 * Coordinates are spherical Mercator world units at R=${R} (see src/lib/projection.js).
 * Paths use relative encoding; feed them straight to <path d>.
 *
 * landFine:   ${FINE.file} clipped to [${FINE.bbox}] at tolerance ${FINE.tolerance}
 * landCoarse: ${COARSE.file} clipped to [${COARSE.bbox}] at tolerance ${COARSE.tolerance}
 */

export const PROJ = { R: ${R} }

export const landFine = ${JSON.stringify(fine.paths, null, 0).replace(/","/g, '",\n  "').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')}

export const landCoarse = ${JSON.stringify(coarse.paths, null, 0).replace(/","/g, '",\n  "').replace(/^\[/, '[\n  ').replace(/\]$/, ',\n]')}
`

  await writeFile(OUT, body)

  const kb = (n) => `${(n / 1024).toFixed(1)} KB`
  const fineBytes = fine.paths.reduce((a, s) => a + s.length, 0)
  const coarseBytes = coarse.paths.reduce((a, s) => a + s.length, 0)

  process.stdout.write(
    `  fine    ${String(fine.paths.length).padStart(4)} rings  ` +
      `${String(fine.keptPoints).padStart(6)} pts  ${kb(fineBytes).padStart(9)}  ` +
      `(from ${fine.rawPoints} pts)\n` +
      `  coarse  ${String(coarse.paths.length).padStart(4)} rings  ` +
      `${String(coarse.keptPoints).padStart(6)} pts  ${kb(coarseBytes).padStart(9)}  ` +
      `(from ${coarse.rawPoints} pts)\n\n` +
      `  wrote src/data/europeMap.js  ${kb(body.length)}\n`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
