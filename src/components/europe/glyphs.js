/**
 * Vehicle silhouettes, hand-authored so they match the hand-inked map rather
 * than an icon set's geometric style.
 *
 * All drawn in a -12 -12 24 24 box with the nose pointing +x, which is the
 * direction truncateLeg() reports its tangent angle in. Rendered in the HTML
 * overlay at fixed screen size, so they never scale with the 22x camera zoom.
 */

export const PLANE =
  'M11 0 L3 2.2 L-1.5 2.2 L-6 9 L-8.5 9 L-6.5 2.2 L-9.5 2.2 L-11 4.5 ' +
  'L-12 4.5 L-11 0 L-12 -4.5 L-11 -4.5 L-9.5 -2.2 L-6.5 -2.2 ' +
  'L-8.5 -9 L-6 -9 L-1.5 -2.2 L3 -2.2 Z'

/**
 * Steam locomotive, side view, running right.
 *
 * Traced back to front: cab roof, cab, boiler, chimney, smokebox, then the
 * sloped nose down to the cowcatcher. The chimney and the tall cab are what
 * make it read as a train rather than a generic box at 30px.
 */
export const TRAIN =
  'M-11.5 4 L-11.5 -7 L-3.5 -7 L-3.5 -2.5 L2 -2.5 L2 -7 L5 -7 L5 -2.5 ' +
  'L6.5 -2.5 L6.5 1 L10 1 L11 4 Z'

export const BUS = 'M-9.5 3.5 L-9.5 -4 Q-9.5 -5.5 -8 -5.5 L8 -5.5 Q9.5 -5.5 9.5 -4 L9.5 3.5 Z'

/**
 * Windows, knocked out in paper colour.
 *
 * Without these both vehicles read as a solid dark block at 30px. They're what
 * makes the shape legible as a vehicle rather than a smudge.
 */
export const DETAIL = {
  plane: [],
  train: [{ x: -9.5, y: -5, w: 4.5, h: 3.4 }],
  bus: [
    { x: -7.5, y: -3.8, w: 3.4, h: 3 },
    { x: -3.2, y: -3.8, w: 3.4, h: 3 },
    { x: 1.1, y: -3.8, w: 3.4, h: 3 },
    { x: 5.4, y: -3.8, w: 2.6, h: 3 },
  ],
}

/**
 * Wheels, drawn under the body. Planes don't get any.
 *
 * Kept separate from the body path so the body can be filled solid while the
 * wheels stay legible against it.
 */
export const WHEELS = {
  plane: [],
  // Big driver up front, smaller carrying wheels behind -- reads as a loco.
  train: [
    [4, 5, 2.6],
    [-2, 5.4, 1.7],
    [-7, 5.4, 1.7],
  ],
  bus: [
    [-5, 4.8, 1.9],
    [5, 4.8, 1.9],
  ],
}

export const GLYPH = { plane: PLANE, train: TRAIN, bus: BUS }

/**
 * Westward headings would render the glyph upside-down.
 *
 * Trains and buses flip to stay upright. Planes deliberately do not -- aircraft
 * bank, and a mirrored silhouette reads as wrong rather than as turning.
 */
export function glyphFlip(mode, angle) {
  if (mode === 'plane') return 1
  return angle > 90 || angle < -90 ? -1 : 1
}

/**
 * Swaps the marker silhouette when a leg changes vehicle.
 *
 * Guarded on the current mode so this only touches the DOM ~20 times over the
 * whole page rather than every frame.
 */
export function setMarkerGlyph(svgEl, mode) {
  const g = svgEl?.querySelector('[data-role="glyph"]')
  if (!g || g.dataset.mode === mode) return
  g.dataset.mode = mode

  const wheels = WHEELS[mode] ?? []
  const detail = DETAIL[mode] ?? []

  g.innerHTML =
    wheels.map(([cx, cy, r]) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`).join('') +
    `<path d="${GLYPH[mode] ?? GLYPH.train}"/>` +
    detail
      .map((d) => `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="#e8dcc0"/>`)
      .join('')
}
