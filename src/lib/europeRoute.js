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

/**
 * Rail and road corridors for the current itinerary, in [longitude, latitude].
 *
 * These are deliberately geographic waypoints rather than screen-space bends.
 * A single bowed arc looks good for a plane, but it can send a train from
 * Bled to Venice across the Adriatic or a train from Rome to Naples into the
 * Tyrrhenian Sea. The waypoints follow the broad rail or road corridor while
 * leaving the exact route detail to the map's red line.
 *
 * Every train or bus hop in the itinerary is listed, including direct hops
 * whose endpoint-to-endpoint line is already safe. That makes adding a new
 * ground leg an explicit, reviewable geometry change instead of silently
 * falling back to an airborne-looking arc.
 */
const GROUND_WAYPOINTS = {
  'amsterdam>berlin': [[9.732, 52.375]], // Hannover
  'berlin>munich': [
    [12.373, 51.34], // Leipzig
    [11.08, 49.45], // Nuremberg
  ],
  'munich>salzburg': [[12.13, 47.86]], // Rosenheim
  'salzburg>vienna': [[14.286, 48.306]], // Linz
  'vienna>prague': [[16.607, 49.195]], // Brno
  'prague>ljubljana': [
    [16.374, 48.208], // Vienna
    [15.439, 47.071], // Graz
    [15.648, 46.555], // Maribor
  ],
  'ljubljana>bovec': [
    [14.355, 46.239], // Kranj
    [13.733, 46.183], // Tolmin
  ],
  'bovec>bohinjska': [[13.733, 46.183]], // Tolmin
  'bohinjska>bled': [],
  'bled>venice': [
    [14.506, 46.057], // Ljubljana
    [13.236, 46.072], // Udine
    [12.245, 45.666], // Treviso
    [12.245, 45.49], // Mestre; the final segment is the rail bridge to Venice
  ],
  'venice>florence': [
    [11.876, 45.406], // Padua
    [11.343, 44.495], // Bologna
  ],
  'florence>rome': [
    [11.88, 43.46], // Arezzo
    [12.11, 42.72], // Orvieto
  ],
  'rome>naples': [[13.83, 41.49]], // Cassino
  'heidelberg>prague': [
    [11.08, 49.45], // Nuremberg
    [12.096, 50.827], // Cheb
  ],
  'prague>krakow': [
    [18.282, 49.835], // Ostrava
    [19.02, 50.26], // Katowice
  ],
  'krakow>zdiar': [[19.95, 49.3]], // Zakopane
  'zdiar>budapest': [
    [21.261, 48.716], // Košice
    [20.78, 48.1], // Miskolc
  ],
  'frankfurt>interlaken': [
    [7.589, 47.56], // Basel
    [7.447, 46.948], // Bern
  ],
}

const PLANE_BOW = 0.16
const PLANE_SAMPLES = 24

/** Quadratic flight arc used only for planes without an explicit great circle. */
function bowedArc(a, b, bow, n = PLANE_SAMPLES) {
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

/** Project a geographic route corridor into the shared SVG coordinate space. */
function routeThroughWaypoints(from, to, waypoints) {
  const coords = [
    [from.lon, from.lat],
    ...waypoints,
    [to.lon, to.lat],
  ]
  const pts = []

  for (let i = 0; i < coords.length - 1; i++) {
    const a = project(...coords[i])
    const b = project(...coords[i + 1])
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 120))
    for (let j = i === 0 ? 0 : 1; j <= n; j++) {
      const t = j / n
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }

  return pts
}

function polyline(fromSlug, toSlug, mode, geo) {
  const a = places[fromSlug]
  const b = places[toSlug]

  if (mode === 'plane' && geo === 'gc') {
    // True great circle -- the northward bow past Greenland is the single most
    // "adventure map" element on the page, and at 11,000km it's a real
    // hundreds-of-km difference from a straight Mercator line.
    const pts = greatCircle(a.lon, a.lat, b.lon, b.lat, 48).map(([lon, lat]) =>
      project(lon, lat)
    )
    return pts
  }

  if (mode === 'plane') {
    const pa = project(a.lon, a.lat)
    const pb = project(b.lon, b.lat)
    return bowedArc(pa, pb, PLANE_BOW)
  }

  const key = `${fromSlug}>${toSlug}`
  if (!Object.prototype.hasOwnProperty.call(GROUND_WAYPOINTS, key)) {
    throw new Error(`Missing explicit ground corridor for ${key}`)
  }
  return routeThroughWaypoints(a, b, GROUND_WAYPOINTS[key])
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
    origin: !!entry.origin,
    arriveBy: entry.via?.mode ?? null,
    departBy: itinerary[i + 1]?.via?.mode ?? null,
    x,
    y,
  }
})

/**
 * The places actually visited -- everything the UI treats as selectable.
 *
 * Separate from `stops` because the route, camera and marker all still need
 * the origin as a real waypoint; it's only the interface that shouldn't offer
 * it as somewhere to read about.
 */
export const destinations = stops.filter((s) => !s.origin)

// Position within `destinations`, for numbering that skips the origin.
destinations.forEach((stop, i) => {
  stop.destIndex = i
})

/** Transfer points -- rendered as small ticks, not full pins, and not clickable. */
export const transfers = Object.entries(places)
  .filter(([, p]) => p.transfer)
  .map(([slug, p]) => {
    const [x, y] = project(p.lon, p.lat)
    return { slug, name: p.name, x, y }
  })

/**
 * The 21 legs. Each carries one or more sub-segments (mixed-mode legs have
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

  const segments = hops.map((hop) => {
    const pts = polyline(hop.from, hop.to, hop.mode, hop.geo)
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
