/**
 * The camera timeline: maps scroll progress 0..1 to a viewBox and a route
 * draw position.
 *
 * THE ONE RULE: every phase is exactly one kind of motion.
 *
 *   dwell -- nothing moves
 *   zoom  -- scale changes, centre is pinned
 *   draw  -- centre pans, scale is pinned
 *
 * That constraint is what makes the movement read as orderly. Compound
 * motion -- panning while zooming while the line grows -- is what makes a
 * camera feel unsettled, and it's what the earlier versions of this file did.
 *
 * It falls out of one decision: THE CAMERA CENTRE IS ALWAYS THE VEHICLE.
 * Not a leg's midpoint, not a blend that ramps in and out -- just the vehicle.
 * Because a dwell happens while the vehicle is parked at a stop, and a leg
 * begins where the previous one ended, the centre is automatically continuous
 * everywhere, with no anchor arithmetic and no seams to reconcile.
 *
 * Scale is quantised to a ladder, so consecutive legs of similar size share a
 * level and the zoom phase between them disappears entirely rather than
 * becoming a pointless twitch.
 *
 * Zoom interpolates in LOG space. Perceived zoom rate is proportional to
 * dw/w, so constant perceived speed requires w to vary exponentially. Linear
 * interpolation across the Atlantic dive rips inward and then crawls.
 */

import { MIN_W, legs, stops, truncateLeg } from './europeRoute.js'

/**
 * Framing. The camera rides the vehicle, so a leg's far end sits a full span
 * away from centre at departure -- the frame has to be about twice the span
 * for the destination to be in view, where a centred-on-the-leg camera would
 * only have needed one.
 */
const FIT_SCALE = 2.0
const FIT_PAD = 200

/**
 * Scale ladder. Snapping each leg up to a discrete level means neighbouring
 * legs of similar size resolve to the SAME level, which lets the zoom phase
 * between them be dropped altogether.
 */
const ZOOM_RATIO = 1.35

/** How far a hero stop punches in from the leg that arrived there. */
const HERO_ZOOM = 0.55

const DIVE_LEG = 2

const DWELL = 0.5
const ZOOM_TIME = 0.55

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Gentler than cubic, so long legs don't crawl at the extremes. */
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function snapZoom(w) {
  if (w <= MIN_W) return MIN_W
  // Nearest, not up. Rounding up costs a whole ladder step of extra altitude
  // on the Atlantic crossing; rounding down by at most a few percent just
  // means the destination slides into frame a moment after departure.
  const steps = Math.round(Math.log(w / MIN_W) / Math.log(ZOOM_RATIO))
  return MIN_W * Math.pow(ZOOM_RATIO, Math.max(0, steps))
}

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
  return Math.max(spanX, spanY * aspect, MIN_W)
}

/**
 * Builds the phase list for a given aspect ratio.
 *
 * Rebuilt on resize rather than stored as viewBox strings -- a literal
 * viewBox doesn't survive a change of viewport shape.
 */
export function buildTimeline(aspect) {
  const legWidths = legs.map((leg) => snapZoom(fitLeg(leg, aspect)))
  const phases = []

  let currentW = null

  /** Emits a pure-zoom phase, or nothing at all if the scale already matches. */
  const zoomTo = (target, stopIndex, legIndex, legT) => {
    if (currentW !== null && Math.abs(target - currentW) < 1) return
    if (currentW !== null) {
      phases.push({
        kind: 'zoom',
        stopIndex,
        legIndex,
        legT,
        w0: currentW,
        w1: target,
        weight: ZOOM_TIME,
      })
    }
    currentW = target
  }

  for (let i = 0; i < stops.length; i++) {
    const arrivingLeg = i - 1
    const departingLeg = i < legs.length ? i : null

    // A hero stop punches in; everything else holds whatever scale it arrived
    // at, so the journey doesn't oscillate in and out at all 21 stops.
    const base = legWidths[arrivingLeg] ?? legWidths[0]
    const stopW = stops[i].hero ? Math.max(MIN_W, snapZoom(base * HERO_ZOOM)) : (currentW ?? base)

    zoomTo(stopW, i, arrivingLeg, 1)

    phases.push({
      kind: 'dwell',
      stopIndex: i,
      legIndex: arrivingLeg,
      legT: 1,
      w0: currentW,
      w1: currentW,
      weight: i === 0 || i === stops.length - 1 ? DWELL * 1.6 : DWELL,
    })

    if (departingLeg === null) continue

    zoomTo(legWidths[departingLeg], i, departingLeg, 0)

    // Longer legs earn more scroll, but sub-linearly: the Atlantic crossing is
    // 20x Munich->Salzburg and must not take 20x the scrolling.
    let weight = Math.min(2, Math.max(0.85, Math.sqrt(legs[departingLeg].length / 3000)))
    if (departingLeg === DIVE_LEG) weight = 2.2

    phases.push({
      kind: 'draw',
      stopIndex: i,
      legIndex: departingLeg,
      w0: currentW,
      w1: currentW,
      weight,
    })
  }

  const total = phases.reduce((a, ph) => a + ph.weight, 0)
  let acc = 0
  for (const ph of phases) {
    ph.p0 = acc / total
    acc += ph.weight
    ph.p1 = acc / total
  }

  return { phases, legWidths, weight: total }
}

/**
 * Samples the timeline.
 *
 * Also returns the truncated leg, because the camera centre is derived from
 * the vehicle position -- computing it here means the camera, the drawn line
 * and the marker all come from one truncation and cannot disagree.
 */
export function sampleTimeline(timeline, p) {
  const { phases } = timeline
  const clamped = p < 0 ? 0 : p > 1 ? 1 : p

  let i = 0
  while (i < phases.length - 1 && clamped >= phases[i].p1) i++
  const ph = phases[i]

  const span = ph.p1 - ph.p0
  const local = span > 0 ? (clamped - ph.p0) / span : 0

  let w
  let legT

  if (ph.kind === 'draw') {
    // Pure pan: scale pinned, vehicle eased along the leg.
    w = ph.w0
    legT = easeInOutSine(local)
  } else if (ph.kind === 'zoom') {
    // Pure zoom: centre pinned (the vehicle is parked), log-interpolated.
    w = ph.w0 * Math.pow(ph.w1 / ph.w0, easeInOutCubic(local))
    legT = ph.legT
  } else {
    w = ph.w0
    legT = ph.legT
  }

  const legIndex = ph.legIndex
  const active = truncateLeg(legs[Math.max(0, legIndex)], legIndex < 0 ? 0 : legT)
  const head = active.head

  return {
    cx: head.x,
    cy: head.y,
    w: Math.max(MIN_W, w),
    legIndex,
    legT,
    phase: ph.kind,
    stopIndex: ph.stopIndex,
    active,
  }
}

/** Scroll progress at which a stop is being dwelled on -- used by the HUD. */
export function progressForStop(timeline, stopIndex) {
  const dwell = timeline.phases.find(
    (ph) => ph.kind === 'dwell' && ph.stopIndex === stopIndex
  )
  return dwell ? (dwell.p0 + dwell.p1) / 2 : 0
}
