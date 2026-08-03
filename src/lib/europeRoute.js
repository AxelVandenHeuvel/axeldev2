/**
 * Derives drawable geometry and the camera timeline from src/data/europe2026.js.
 *
 * Runs once at module load. It's ~700 points of arithmetic -- sub-millisecond
 * -- so there's no reason to bake it, and keeping it live means editing the
 * itinerary needs no rebuild step.
 *
 * Everything becomes a polyline. Great circles, bowed beziers, multi-segment
 * legs -- all of it collapses to arrays of points, which means there is
 * exactly ONE truncation code path for the progressive route draw.
 */

import { greatCircle, project } from './projection.js'
import { itinerary, places } from '../data/europe2026.js'

/**
 * Zoom floor, in world units. ~521km across at 47N.
 *
 * Derived, not guessed: the baked geometry deviates up to ~0.87km from truth
 * (tolerance 2). For that error to stay under ~1.5 screen px on a 900px-wide
 * stage you need at least 0.87 * 900 / 1.5 = 522km of ground width.
 *
 * If you ever raise the tolerance in scripts/build-europe-map.mjs to save
 * bytes, RAISE THIS PROPORTIONALLY or Slovenia turns into a visible polygon.
 */
export const MIN_W = 1200

/** How far a leg bows off the straight line, as a fraction of its length. */
const BOW = { plane: 0.16, train: 0.05, bus: 0.08 }

/**
 * Hand-drawn wobble, as a fraction of the segment's own length and capped.
 *
 * A fixed amplitude is wrong: 8 world units is a pleasant waver across the
 * Atlantic but is ~8% of the Bovec->Bled hop, which reads as the line being
 * broken rather than hand-inked.
 */
const JITTER_RATIO = 0.012
const JITTER_MAX = 8

const SAMPLES = 24

/** Deterministic LCG. Seeded per-leg so the wobble is stable across reloads. */
function makeRandom(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296 - 0.5
  }
}

/** Quadratic bezier through a perpendicular control point offset. */
function bowedArc(a, b, bow, n = SAMPLES) {
  const mx = (a[0] + b[0]) / 2
  const my = (a[1] + b[1]) / 2
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const cx = mx - dy * bow
  const cy = my + dx * bow

  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const u = 1 - t
    pts.push([
      u * u * a[0] + 2 * u * t * cx + t * t * b[0],
      u * u * a[1] + 2 * u * t * cy + t * t * b[1],
    ])
  }
  return pts
}

/** Perturbs interior vertices so the line reads hand-inked. Endpoints stay put. */
function jitter(pts, amp, seed) {
  const rnd = makeRandom(seed)
  return pts.map((p, i) =>
    i === 0 || i === pts.length - 1 ? p : [p[0] + rnd() * amp, p[1] + rnd() * amp]
  )
}

function polyline(fromSlug, toSlug, mode, geo, seed) {
  const a = places[fromSlug]
  const b = places[toSlug]
  let pts

  if (geo === 'gc') {
    // True great circle -- the northward bow past Greenland is the single most
    // "adventure map" element on the page, and at 11,000km it's a real
    // hundreds-of-km difference from a straight Mercator line.
    pts = greatCircle(a.lon, a.lat, b.lon, b.lat, 48).map(([lon, lat]) => project(lon, lat))
  } else {
    pts = bowedArc(project(a.lon, a.lat), project(b.lon, b.lat), BOW[mode] ?? BOW.train)
  }

  const span = Math.hypot(
    pts[pts.length - 1][0] - pts[0][0],
    pts[pts.length - 1][1] - pts[0][1]
  )
  return jitter(pts, Math.min(JITTER_MAX, span * JITTER_RATIO), seed)
}

/** Cumulative arc length, so truncation can be done by distance rather than index. */
function cumulative(pts) {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  return cum
}

/** Stops in journey order, with screen-relevant metadata resolved. */
export const stops = itinerary.map((entry, i) => {
  const place = places[entry.place]
  const [x, y] = project(place.lon, place.lat)
  return {
    index: i,
    slug: entry.place,
    key: `${entry.place}-${entry.visit ?? 1}`,
    name: place.name,
    country: place.country,
    blurb: place.blurb ?? '',
    photos: place.photos ?? [],
    visit: entry.visit,
    hero: !!entry.hero,
    arriveBy: entry.via?.mode ?? null,
    departBy: itinerary[i + 1]?.via?.mode ?? null,
    x,
    y,
  }
})

/** Transfer points -- rendered as small ticks, not full pins, and not clickable. */
export const transfers = Object.entries(places)
  .filter(([, p]) => p.transfer)
  .map(([slug, p]) => {
    const [x, y] = project(p.lon, p.lat)
    return { slug, name: p.name, x, y }
  })

/**
 * The 20 legs. Each carries one or more sub-segments (mixed-mode legs have
 * two), and each sub-segment is an independent polyline with its own mode --
 * which is what makes the drawn line change from railroad ties to bus dots at
 * the transfer point.
 */
export const legs = itinerary.slice(1).map((entry, i) => {
  const fromSlug = itinerary[i].place
  const toSlug = entry.place
  const via = entry.via ?? { mode: 'train' }

  const hops =
    via.mode === 'multi'
      ? via.segments.map((seg, j) => ({
          from: j === 0 ? fromSlug : via.segments[j - 1].to,
          to: seg.to,
          mode: seg.mode,
          geo: null,
        }))
      : [{ from: fromSlug, to: toSlug, mode: via.mode, geo: via.geo ?? null }]

  const segments = hops.map((hop, j) => {
    const pts = polyline(hop.from, hop.to, hop.mode, hop.geo, (i + 1) * 977 + j * 31)
    const cum = cumulative(pts)
    return { mode: hop.mode, pts, cum, length: cum[cum.length - 1] }
  })

  const length = segments.reduce((a, s) => a + s.length, 0)

  return {
    index: i,
    from: fromSlug,
    to: toSlug,
    mode: via.mode === 'multi' ? via.segments[via.segments.length - 1].mode : via.mode,
    modes: segments.map((s) => s.mode),
    segments,
    length,
  }
})

/**
 * Truncates a leg at fraction t of its total length.
 *
 * Returns the partial path `d` for every sub-segment, plus the head position
 * and tangent angle -- all in one pass, so the route head and the vehicle
 * glyph are guaranteed to agree exactly.
 *
 * Deliberately pure arithmetic: getPointAtLength() would force a layout flush
 * inside the rAF loop, which is the classic cause of scroll jank.
 */
export function truncateLeg(leg, t) {
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t

  // At t=0 nothing is drawn, but the marker still needs somewhere to sit --
  // parked at the origin, already facing the way it's about to go.
  if (clamped === 0) {
    const first = leg.segments[0]
    return {
      parts: leg.segments.map(() => null),
      head: {
        x: first.pts[0][0],
        y: first.pts[0][1],
        angle: angleBetween(first.pts[0], first.pts[1]),
        mode: first.mode,
      },
    }
  }

  let remaining = leg.length * clamped

  const parts = []
  let head = null

  for (const seg of leg.segments) {
    if (remaining <= 0) {
      parts.push(null)
      continue
    }

    if (remaining >= seg.length) {
      parts.push(pathFrom(seg.pts, seg.pts.length))
      const n = seg.pts.length
      head = {
        x: seg.pts[n - 1][0],
        y: seg.pts[n - 1][1],
        angle: angleBetween(seg.pts[n - 2], seg.pts[n - 1]),
        mode: seg.mode,
      }
      remaining -= seg.length
      continue
    }

    // Partway through this sub-segment: find the straddling vertex pair.
    const { cum, pts } = seg
    let i = 1
    while (i < cum.length - 1 && cum[i] < remaining) i++

    const span = cum[i] - cum[i - 1]
    const f = span > 0 ? (remaining - cum[i - 1]) / span : 0
    const [px, py] = pts[i - 1]
    const [qx, qy] = pts[i]
    const x = px + (qx - px) * f
    const y = py + (qy - py) * f

    parts.push(`${pathFrom(pts, i)}L${round(x)} ${round(y)}`)
    head = { x, y, angle: angleBetween([px, py], [qx, qy]), mode: seg.mode }
    remaining = 0
  }

  return { parts, head }
}

function pathFrom(pts, count) {
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`
  for (let i = 1; i < count; i++) d += `L${round(pts[i][0])} ${round(pts[i][1])}`
  return d
}

/** Full path for a sub-segment, used for completed legs (set once, never touched). */
export function segmentPath(seg) {
  return pathFrom(seg.pts, seg.pts.length)
}

function angleBetween(a, b) {
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}

function round(n) {
  return Math.round(n * 10) / 10
}

/** Bounding box of the whole route, for the static fallback's fitted view. */
export function routeBounds(pad = 400) {
  const xs = []
  const ys = []
  for (const leg of legs) {
    for (const seg of leg.segments) {
      for (const [x, y] of seg.pts) {
        xs.push(x)
        ys.push(y)
      }
    }
  }
  return {
    minX: Math.min(...xs) - pad,
    minY: Math.min(...ys) - pad,
    maxX: Math.max(...xs) + pad,
    maxY: Math.max(...ys) + pad,
  }
}
