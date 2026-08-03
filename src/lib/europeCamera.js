/**
 * The camera timeline: maps scroll progress 0..1 to a viewBox and a route
 * draw position.
 *
 * Shots alternate between legs and *hero* stops. Minor stops deliberately get
 * no keyframe of their own -- the camera pans continuously through them,
 * because easing to a halt at all 21 stops reads as stop-motion rather than
 * cinema. Only the hero stops settle.
 *
 * Zoom interpolates in LOG space. Perceived zoom rate is proportional to
 * dw/w, so constant perceived speed requires w to vary exponentially. Linear
 * interpolation across the Atlantic dive (11000 -> 2400) would rip inward and
 * then crawl.
 */

import { MIN_W, legs, stops } from './europeRoute.js'

/** Framing padding as a fraction of leg span, plus a floor for near-coincident stops. */
const FIT_SCALE = 1.55
const FIT_PAD = 140

/** Leg index of the dive: the one transition from Atlantic scale to Europe scale. */
const DIVE_LEG = 2

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Frames a leg's two endpoints.
 *
 * Width is the binding dimension, so a tall portrait viewport still fits the
 * vertical span -- that's what `spanY * aspect` is doing.
 */
function fitLeg(leg, aspect) {
  const pts = leg.segments.flatMap((s) => s.pts)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of pts) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const spanX = (maxX - minX) * FIT_SCALE + FIT_PAD
  const spanY = (maxY - minY) * FIT_SCALE + FIT_PAD
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: Math.max(spanX, spanY * aspect, MIN_W),
  }
}

/**
 * Builds the shot list for a given aspect ratio.
 *
 * Rebuilt on resize rather than stored as viewBox strings -- storing literal
 * viewBoxes breaks the moment the viewport changes shape.
 */
export function buildTimeline(aspect) {
  const shots = []
  const legFits = legs.map((leg) => fitLeg(leg, aspect))

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]

    if (stop.hero) {
      // A settle punches in from whichever adjacent leg is tighter, rather
      // than always dropping to MIN_W. Seattle sits between nothing and an
      // 11,000km ocean crossing, so slamming it to a 520km view would frame
      // an empty rectangle -- the fine geometry layer is Europe only.
      const neighbours = [legFits[i - 1]?.w, legFits[i]?.w].filter(Boolean)
      const context = neighbours.length ? Math.min(...neighbours) : MIN_W

      shots.push({
        kind: 'stop',
        stopIndex: i,
        legIndex: i - 1, // route is drawn through the leg that arrived here
        legT: 1,
        settle: true,
        cx: stop.x,
        cy: stop.y,
        w: Math.max(MIN_W, context * 0.55),
        weight: i === 0 || i === stops.length - 1 ? 1.1 : 0.85,
      })
    }

    const leg = legs[i]
    if (!leg) continue

    const fit = legFits[i]
    // Longer legs earn more scroll, but sub-linearly -- the Atlantic crossing
    // is 20x Munich->Salzburg and should not take 20x the scrolling.
    const relative = Math.sqrt(leg.length / 3000)
    let weight = Math.min(2, Math.max(0.75, relative))
    if (i === DIVE_LEG) weight = 2.2 // the money shot; give it screen time

    shots.push({
      kind: 'leg',
      legIndex: i,
      settle: false,
      cx: fit.cx,
      cy: fit.cy,
      w: fit.w,
      weight,
    })
  }

  // Normalise weights into cumulative 0..1 knots.
  const total = shots.reduce((a, s) => a + s.weight, 0)
  let acc = 0
  for (const shot of shots) {
    shot.t0 = acc / total
    acc += shot.weight
    shot.t1 = acc / total
  }

  return shots
}

/**
 * Samples the timeline.
 *
 * Returns the camera box plus which leg is drawing and how far -- one call per
 * frame drives both the viewBox and the route head.
 */
export function sampleTimeline(shots, p) {
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p

  let i = 0
  while (i < shots.length - 1 && clamped >= shots[i].t1) i++
  const shot = shots[i]
  const next = shots[i + 1]

  const span = shot.t1 - shot.t0
  const local = span > 0 ? (clamped - shot.t0) / span : 0

  // Route progress: a leg shot draws its leg; a stop shot holds it complete.
  const legIndex = shot.kind === 'leg' ? shot.legIndex : shot.legIndex
  const legT = shot.kind === 'leg' ? local : shot.legT

  if (!next) {
    return { cx: shot.cx, cy: shot.cy, w: shot.w, legIndex, legT, shotIndex: i }
  }

  // Ease to a stop only where a settle is involved. Elsewhere the camera pans
  // through at constant rate, which is what keeps 29 shots from stuttering.
  const eased = shot.settle || next.settle ? easeInOutCubic(local) : local

  return {
    cx: shot.cx + (next.cx - shot.cx) * eased,
    cy: shot.cy + (next.cy - shot.cy) * eased,
    // Log-space zoom: w = w0 * (w1/w0)^t
    w: Math.max(MIN_W, shot.w * Math.pow(next.w / shot.w, eased)),
    legIndex,
    legT,
    shotIndex: i,
  }
}

/** Scroll progress at which a given stop is centred -- used by the HUD index. */
export function progressForStop(shots, stopIndex) {
  const settle = shots.find((s) => s.kind === 'stop' && s.stopIndex === stopIndex)
  if (settle) return (settle.t0 + settle.t1) / 2
  // Minor stops have no shot of their own: they sit at the end of their arrival leg.
  const leg = shots.find((s) => s.kind === 'leg' && s.legIndex === stopIndex - 1)
  if (leg) return leg.t1
  return 0
}

/** Which stop the viewer should consider "current" at a given progress. */
export function stopAtProgress(shots, p) {
  const { legIndex, legT } = sampleTimeline(shots, p)
  if (legIndex < 0) return 0
  return legT >= 0.999 ? legIndex + 1 : legIndex + (legT > 0.5 ? 1 : 0)
}
