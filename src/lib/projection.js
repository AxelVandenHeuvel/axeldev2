/**
 * Spherical Mercator projection — the single source of truth for map geometry.
 *
 * Imported by BOTH scripts/build-europe-map.mjs (at bake time) and the app (at
 * runtime). If these two ever disagree, every pin silently slides off its
 * coastline by the same amount, which is nearly impossible to spot by eye.
 * Don't inline this math anywhere else.
 *
 * Mercator is chosen deliberately: x stays linear in longitude across the
 * -122째 to +20째 span the Atlantic opening needs, it stays conformal at every
 * zoom (so Slovenia looks like Slovenia at 500km framing), and it inverts
 * cheaply for screen-space pin placement. The cost is inflated high latitudes
 * -- Iceland renders 2.3x too big -- which is exactly what a 1930s route map
 * looked like.
 */

/** World units per radian. 1 unit ~= 0.637 km at the equator, x cos(lat) on the ground. */
export const R = 10000

const D = Math.PI / 180

/** lon/lat in degrees -> [x, y] world units. y is negated because SVG y grows downward. */
export function project(lon, lat) {
  // Clamp near the poles or log(tan(...)) runs away to infinity.
  const phi = Math.max(-84, Math.min(84, lat)) * D
  return [R * lon * D, -R * Math.log(Math.tan(Math.PI / 4 + phi / 2))]
}

/** [x, y] world units -> lon/lat in degrees. */
export function unproject(x, y) {
  return [x / R / D, (2 * Math.atan(Math.exp(-y / R)) - Math.PI / 2) / D]
}

/**
 * Samples the great-circle path between two points as lon/lat pairs.
 *
 * Only worth it for the two transatlantic legs. Below ~1200km a great circle
 * and a straight Mercator line are visually identical, so the shorter legs use
 * bowed beziers instead (see europeRoute.js).
 */
export function greatCircle(lon1, lat1, lon2, lat2, n = 48) {
  const p1 = lat1 * D
  const l1 = lon1 * D
  const p2 = lat2 * D
  const l2 = lon2 * D

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((p2 - p1) / 2) ** 2 +
          Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2
      )
    )

  // Coincident points have no defined great circle.
  if (!d || !isFinite(d)) return [[lon1, lat1], [lon2, lat2]]

  const out = []
  for (let i = 0; i <= n; i++) {
    const f = i / n
    const A = Math.sin((1 - f) * d) / Math.sin(d)
    const B = Math.sin(f * d) / Math.sin(d)
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2)
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2)
    const z = A * Math.sin(p1) + B * Math.sin(p2)
    out.push([Math.atan2(y, x) / D, Math.atan2(z, Math.hypot(x, y)) / D])
  }
  return out
}
