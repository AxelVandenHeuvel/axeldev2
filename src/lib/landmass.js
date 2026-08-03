/**
 * Point-in-land test against the baked coastline.
 *
 * Exists for one reason: a route's bow is a perpendicular offset, and
 * perpendicular has two directions. Pick the wrong one where Italy is narrow
 * and a train from Florence to Rome sails down the Tyrrhenian. Rather than
 * hand-tuning a sign per leg, europeRoute tries both and asks this module
 * which one stays on land.
 *
 * Built lazily and once. The bounding-box pre-filter is what makes it cheap --
 * a point in Tuscany is tested against the two or three rings whose box
 * actually contains it, not all 147.
 *
 * Note that interior rings (lakes) read as land here. That's correct for the
 * question being asked, which is "is this over open sea".
 */

import { landFine } from '../data/europeMap.js'

let rings = null

/** Parses one relative path -- "M x y l dx dy dx dy ... z" -- back to points. */
function decodeRing(d) {
  const cut = d.indexOf('l')
  if (cut < 0) return null

  const head = d.slice(1, cut).split(' ')
  let x = +head[0]
  let y = +head[1]

  const deltas = d.slice(cut + 1, -1).split(' ')
  const xs = [x]
  const ys = [y]
  for (let i = 0; i + 1 < deltas.length; i += 2) {
    x += +deltas[i]
    y += +deltas[i + 1]
    xs.push(x)
    ys.push(y)
  }
  if (xs.length < 3) return null

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (let i = 0; i < xs.length; i++) {
    if (xs[i] < minX) minX = xs[i]
    if (xs[i] > maxX) maxX = xs[i]
    if (ys[i] < minY) minY = ys[i]
    if (ys[i] > maxY) maxY = ys[i]
  }

  return { xs, ys, minX, minY, maxX, maxY }
}

function build() {
  const out = []
  for (const d of landFine) {
    const ring = decodeRing(d)
    if (ring) out.push(ring)
  }
  return out
}

/** Standard ray-casting crossing count. */
function inRing(px, py, ring) {
  const { xs, ys } = ring
  let inside = false
  for (let i = 0, j = xs.length - 1; i < xs.length; j = i++) {
    if (ys[i] > py !== ys[j] > py) {
      const t = (py - ys[i]) / (ys[j] - ys[i])
      if (px < xs[i] + t * (xs[j] - xs[i])) inside = !inside
    }
  }
  return inside
}

export function isOnLand(x, y) {
  if (!rings) rings = build()
  for (const ring of rings) {
    if (x < ring.minX || x > ring.maxX || y < ring.minY || y > ring.maxY) continue
    if (inRing(x, y, ring)) return true
  }
  return false
}

/**
 * How many of a polyline's interior points sit over open water.
 *
 * Ignores a margin at each end. Some cities genuinely aren't inside a land
 * ring at this resolution -- Venice sits in a lagoon -- and counting their
 * approach would make every candidate bow look equally bad, which defeats the
 * search. What we're looking for is a line that strays out to sea in the
 * MIDDLE, which is the part a bow controls anyway.
 */
export function waterCount(pts) {
  const margin = Math.max(1, Math.round(pts.length * 0.14))
  let n = 0
  for (let i = margin; i < pts.length - margin; i++) {
    if (!isOnLand(pts[i][0], pts[i][1])) n++
  }
  return n
}
