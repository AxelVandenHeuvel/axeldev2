/**
 * The camera timeline: maps scroll progress 0..1 to a viewBox and a route
 * draw position.
 *
 * Built as explicit PHASES rather than keyframes the camera continuously
 * interpolates between. That distinction matters: with plain keyframes the
 * camera is already travelling toward the next framing while the vehicle is
 * only halfway through the current leg, so the zoom visibly "pre-fires" the
 * arrival. Here each leg gets a draw phase during which the camera does not
 * move at all, bracketed by explicit transitions.
 *
 *   dwell(i)  -- camera parked on stop i, route static. The pause.
 *   depart(i) -- camera moves from the stop framing out to leg i's framing.
 *   draw(i)   -- camera HELD still; the route line draws 0 -> 1.
 *   approach  -- camera settles into a hero stop's tighter framing.
 *
 * Because a leg's framing fits both its endpoints with padding, holding the
 * camera during the draw also guarantees the vehicle marker stays on screen
 * for the whole leg.
 *
 * Zoom interpolates in LOG space. Perceived zoom rate is proportional to
 * dw/w, so constant perceived speed requires w to vary exponentially. Linear
 * interpolation across the Atlantic dive (11000 -> 2400) rips inward and then
 * crawls.
 */

import { MIN_W, legs, stops } from './europeRoute.js'

/** Framing padding as a fraction of leg span, plus a floor for close stops. */
const FIT_SCALE = 1.55
const FIT_PAD = 140

/** Leg index of the dive: the one transition from Atlantic to Europe scale. */
const DIVE_LEG = 2

/** Scroll weight per phase kind. Dwell is the deliberate pause at each stop. */
const DWELL = 0.5
const TRANSITION = 0.42

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Gentler than cubic -- used for the vehicle so long legs don't crawl. */
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

/**
 * Frames a leg's two endpoints.
 *
 * Width is the binding dimension, so a tall portrait viewport still fits the
 * vertical span -- that's what `spanY * aspect` is doing.
 */
function fitLeg(leg, aspect) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const seg of leg.segments) {
    for (const [x, y] of seg.pts) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
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
 * Builds the phase list for a given aspect ratio.
 *
 * Rebuilt on resize rather than stored as viewBox strings -- a literal
 * viewBox doesn't survive a change of viewport shape.
 */
export function buildTimeline(aspect) {
  const legViews = legs.map((leg) => fitLeg(leg, aspect))
  const phases = []

  /**
   * Where the camera rests at stop i.
   *
   * Hero stops punch in. Everything else simply holds wherever the arriving
   * leg left the camera -- zooming in and back out at all 21 stops would be
   * seasick, and the pause alone is enough to register as an arrival.
   */
  const stopView = (i) => {
    const stop = stops[i]
    if (stop.hero) {
      const neighbours = [legViews[i - 1]?.w, legViews[i]?.w].filter(Boolean)
      const context = neighbours.length ? Math.min(...neighbours) : MIN_W
      return { cx: stop.x, cy: stop.y, w: Math.max(MIN_W, context * 0.55) }
    }
    const v = legViews[i - 1] ?? legViews[i]
    return { cx: v.cx, cy: v.cy, w: v.w }
  }

  for (let i = 0; i < stops.length; i++) {
    const sv = stopView(i)

    // Settle into a hero city before pausing on it.
    if (i > 0 && stops[i].hero) {
      phases.push({
        kind: 'approach',
        stopIndex: i,
        from: legViews[i - 1],
        to: sv,
        legIndex: i - 1,
        t0: 1,
        t1: 1,
        weight: TRANSITION,
        ease: 'cubic',
      })
    }

    // The pause. Camera and route both completely static.
    phases.push({
      kind: 'dwell',
      stopIndex: i,
      from: sv,
      to: sv,
      legIndex: i - 1,
      t0: 1,
      t1: 1,
      weight: i === 0 || i === stops.length - 1 ? DWELL * 1.6 : DWELL,
      ease: 'linear',
    })

    const leg = legs[i]
    if (!leg) continue

    const lv = legViews[i]

    // Pull out to frame the leg BEFORE any of it is drawn.
    phases.push({
      kind: 'depart',
      stopIndex: i,
      from: sv,
      to: lv,
      legIndex: i,
      t0: 0,
      t1: 0,
      weight: TRANSITION,
      ease: 'cubic',
    })

    // The draw. Camera is held -- from === to -- so the zoom cannot run ahead
    // of the vehicle. Longer legs earn more scroll, but sub-linearly: the
    // Atlantic crossing is 20x Munich->Salzburg and must not take 20x the
    // scrolling.
    let weight = Math.min(2, Math.max(0.8, Math.sqrt(leg.length / 3000)))
    if (i === DIVE_LEG) weight = 2.2

    phases.push({
      kind: 'draw',
      stopIndex: i,
      from: lv,
      to: lv,
      legIndex: i,
      t0: 0,
      t1: 1,
      weight,
      ease: 'sine',
    })
  }

  const total = phases.reduce((a, ph) => a + ph.weight, 0)
  let acc = 0
  for (const ph of phases) {
    ph.p0 = acc / total
    acc += ph.weight
    ph.p1 = acc / total
  }

  return { phases, legViews, dashWidths: dashWidths(legViews), weight: total }
}

/**
 * Reference width used to size each leg's dash pattern.
 *
 * Dashes must be sized per-leg and then frozen -- rescaling them to the live
 * zoom every frame makes the pattern slide along legs that are already drawn.
 * But sizing each purely by its own framing spans an 18x range between the
 * Atlantic crossing and a 500km hop, so a wide leg looks absurdly chunky when
 * a later, tighter shot happens to include it.
 *
 * Compressing by a 0.7 exponent keeps the ordering (air routes still read as
 * bolder than rail, which is correct for the period) while pulling the
 * extremes toward the median.
 */
function dashWidths(legViews) {
  const sorted = legViews.map((v) => v.w).sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)] || MIN_W
  return legViews.map((v) => median * Math.pow(v.w / median, 0.7))
}

/**
 * Samples the timeline.
 *
 * Returns the camera box plus which leg is drawing and how far -- one call per
 * frame drives both the viewBox and the route head.
 */
export function sampleTimeline(timeline, p) {
  const { phases } = timeline
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p

  let i = 0
  while (i < phases.length - 1 && clamped >= phases[i].p1) i++
  const ph = phases[i]

  const span = ph.p1 - ph.p0
  const local = span > 0 ? (clamped - ph.p0) / span : 0
  const eased =
    ph.ease === 'cubic'
      ? easeInOutCubic(local)
      : ph.ease === 'sine'
        ? easeInOutSine(local)
        : local

  const w =
    ph.from.w === ph.to.w
      ? ph.from.w
      : ph.from.w * Math.pow(ph.to.w / ph.from.w, eased)

  return {
    cx: ph.from.cx + (ph.to.cx - ph.from.cx) * eased,
    cy: ph.from.cy + (ph.to.cy - ph.from.cy) * eased,
    w: Math.max(MIN_W, w),
    legIndex: ph.legIndex,
    legT: ph.t0 + (ph.t1 - ph.t0) * eased,
    phase: ph.kind,
    stopIndex: ph.stopIndex,
  }
}

/** Scroll progress at which a stop is being dwelled on -- used by the HUD. */
export function progressForStop(timeline, stopIndex) {
  const dwell = timeline.phases.find(
    (ph) => ph.kind === 'dwell' && ph.stopIndex === stopIndex
  )
  return dwell ? (dwell.p0 + dwell.p1) / 2 : 0
}
