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

export const TRAIN = 'M-10 3.5 L-10 -2 L1 -2 L1 -5.5 L7 -5.5 L10 -2 L10 3.5 Z'

export const BUS = 'M-9 3.5 L-9 -4 Q-9 -5 -8 -5 L8 -5 Q9 -5 9 -4 L9 3.5 Z'

/**
 * Wheels, drawn under the body. Planes don't get any.
 *
 * Kept separate from the body path so the body can be filled solid while the
 * wheels stay legible against it.
 */
export const WHEELS = {
  plane: [],
  train: [
    [-6, 5],
    [6, 5],
  ],
  bus: [
    [-5, 5],
    [5, 5],
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
  g.innerHTML =
    `<path d="${GLYPH[mode] ?? GLYPH.train}"/>` +
    wheels.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="1.9"/>`).join('')
}
