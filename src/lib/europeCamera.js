/**
 * The camera timeline: maps scroll progress 0..1 to a viewBox and a route
 * draw position.
 *
 * Draw phases are tracking shots. The scale is fixed for the whole leg while
 * the camera follows the route head exactly. The moving line and its arrival
 * destination therefore occupy the center of the screen at every frame.
 */

import { MIN_W, legs, stops, truncateLeg } from './europeRoute.js'

/**
 * Tracking shots are intentionally much tighter than a complete-leg fit.
 * The minimum keeps short mountain hops legible and leaves enough paper around
 * the route head for the map to read as a map rather than a red line alone.
 */
const TRACK_MIN = MIN_W * 1.55
const TRACK_MAX = 7200
const TRACK_LENGTH_RATIO = 0.42
const TRACK_PAD = 520

/** Extra scroll weight for legs that cross multiple tracking-frame widths. */
const TRACK_SCROLL_FACTOR = 1.25

/** Keep the scale ladder so adjacent shots do not make tiny zoom corrections. */
const ZOOM_RATIO = 1.35

const DIVE_LEG = 2

const DWELL = 0.5
const ZOOM_TIME = 0.55

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Gentler than cubic, so long legs do not crawl at the extremes. */
function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function snapZoom(w) {
  if (w <= MIN_W) return MIN_W
  // Round up so the chosen shot never becomes narrower than its safety fit.
  const steps = Math.ceil(Math.log(w / MIN_W) / Math.log(ZOOM_RATIO))
  return MIN_W * Math.pow(ZOOM_RATIO, Math.max(0, steps))
}

function legBounds(leg) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const segment of leg.segments) {
    for (const [x, y] of segment.pts) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  return { minX, minY, maxX, maxY }
}

/** Returns one point on a leg at an arc-length distance from its origin. */
function pointAtDistance(leg, distance) {
  let remaining = clamp(distance, 0, leg.length)

  for (const segment of leg.segments) {
    if (remaining <= segment.length) {
      const { pts, cum } = segment
      let i = 1
      while (i < cum.length - 1 && cum[i] < remaining) i++

      const span = cum[i] - cum[i - 1]
      const f = span > 0 ? (remaining - cum[i - 1]) / span : 0
      const [ax, ay] = pts[i - 1]
      const [bx, by] = pts[i]
      return [ax + (bx - ax) * f, ay + (by - ay) * f]
    }
    remaining -= segment.length
  }

  return leg.segments[leg.segments.length - 1].pts.at(-1)
}

/**
 * Computes a tracking centre for a route position. The route head is the
 * centre. At t=1 this is also the destination, so there is no arrival pan.
 */
function trackingCenter(leg, t) {
  const distance = leg.length * clamp(t, 0, 1)
  const head = pointAtDistance(leg, distance)

  return {
    cx: head[0],
    cy: head[1],
  }
}

/**
 * Builds a stable close-up width for a leg. Length supplies the tracking
 * scale, while the route's cross-axis span prevents a bend from touching the
 * edge of a wide viewport. The width never changes during the draw phase.
 */
function trackingWidth(leg, aspect) {
  const { minY, maxY } = legBounds(leg)
  const lengthFit = leg.length * TRACK_LENGTH_RATIO + TRACK_PAD
  const crossAxisFit = (maxY - minY) * aspect * 1.28 + TRACK_PAD
  return snapZoom(Math.min(TRACK_MAX, Math.max(TRACK_MIN, lengthFit, crossAxisFit)))
}

function buildFrame(leg, aspect) {
  const w = trackingWidth(leg, aspect)
  return {
    w,
    start: trackingCenter(leg, 0),
    end: trackingCenter(leg, 1),
  }
}

/**
 * Builds the phase list for a given aspect ratio.
 *
 * Rebuilt on resize rather than stored as viewBox strings because a literal
 * viewBox does not survive a change of viewport shape.
 */
export function buildTimeline(aspect) {
  const frames = legs.map((leg) => buildFrame(leg, aspect))
  const legWidths = frames.map((frame) => frame.w)
  const phases = []

  let currentW = null
  let currentCenter = null

  const pushZoom = (w0, w1, from, to, stopIndex, legIndex, legT) => {
    phases.push({
      kind: 'zoom',
      stopIndex,
      legIndex,
      legT,
      w0,
      w1,
      cx0: from.cx,
      cy0: from.cy,
      cx1: to.cx,
      cy1: to.cy,
      weight: ZOOM_TIME,
    })
  }

  /** Emits a parked transition to the next tracking shot. */
  const zoomTo = (target, center, stopIndex, legIndex) => {
    if (
      currentW !== null &&
      Math.abs(target - currentW) < 1 &&
      Math.abs(center.cx - currentCenter.cx) < 1 &&
      Math.abs(center.cy - currentCenter.cy) < 1
    ) {
      return
    }

    if (currentW !== null) {
      const dx = Math.abs(center.cx - currentCenter.cx)
      const dy = Math.abs(center.cy - currentCenter.cy)
      const left = Math.min(currentCenter.cx - currentW / 2, center.cx - target / 2)
      const right = Math.max(currentCenter.cx + currentW / 2, center.cx + target / 2)
      const top = Math.min(
        currentCenter.cy - currentW / (2 * aspect),
        center.cy - target / (2 * aspect)
      )
      const bottom = Math.max(
        currentCenter.cy + currentW / (2 * aspect),
        center.cy + target / (2 * aspect)
      )

      // Widen before a long pan so the paper never snaps out from under the
      // camera during the parked transition. The draw phase returns to the
      // target width before the route starts moving again.
      const transitionW = snapZoom(
        Math.max(
          currentW,
          target,
          right - left + dx,
          (bottom - top + dy) * aspect
        ) * 1.12
      )

      if (Math.abs(transitionW - currentW) >= 1) {
        const parkedLeg = Math.max(-1, legIndex - 1)
        pushZoom(
          currentW,
          transitionW,
          currentCenter,
          currentCenter,
          stopIndex,
          parkedLeg,
          parkedLeg < 0 ? 0 : 1
        )
      }
      if (dx >= 1 || dy >= 1) {
        pushZoom(
          transitionW,
          transitionW,
          currentCenter,
          center,
          stopIndex,
          Math.max(-1, legIndex - 1),
          legIndex > 0 ? 1 : 0
        )
      }
      if (Math.abs(target - transitionW) >= 1) {
        pushZoom(
          transitionW,
          target,
          center,
          center,
          stopIndex,
          Math.max(-1, legIndex - 1),
          legIndex > 0 ? 1 : 0
        )
      }
    }

    currentW = target
    currentCenter = center
  }

  for (let i = 0; i < stops.length; i++) {
    const arrivingLeg = i - 1
    const departingLeg = i < legs.length ? i : null
    const arrivingFrame = frames[arrivingLeg] ?? frames[0]
    const stopW = currentW ?? arrivingFrame.w
    const stopCenter = arrivingLeg >= 0 ? arrivingFrame.end : frames[0].start

    zoomTo(stopW, stopCenter, i, arrivingLeg)

    phases.push({
      kind: 'dwell',
      stopIndex: i,
      legIndex: arrivingLeg,
      legT: 1,
      w0: currentW,
      w1: currentW,
      weight: i === 0 || i === stops.length - 1 ? DWELL * 1.6 : DWELL,
      cx: currentCenter.cx,
      cy: currentCenter.cy,
    })

    if (departingLeg === null) continue

    zoomTo(frames[departingLeg].w, frames[departingLeg].start, i, departingLeg)

    // Longer legs earn more scroll, but sub-linearly. The transatlantic
    // opening is long without making every short hop feel rushed.
    const apparentTravel = legs[departingLeg].length / frames[departingLeg].w
    let weight = Math.max(
      0.85,
      Math.sqrt(legs[departingLeg].length / 3000),
      apparentTravel * TRACK_SCROLL_FACTOR
    )
    if (departingLeg === DIVE_LEG) weight = 2.2

    phases.push({
      kind: 'draw',
      stopIndex: i,
      legIndex: departingLeg,
      legT: 0,
      w0: currentW,
      w1: currentW,
      weight,
    })

    // Draw sampling follows the live route head, so the mutable handoff state
    // must advance to the same endpoint before the next stop is built.
    // Leaving this at the leg's departure center creates a rewind phase at the
    // next boundary, even though the preceding draw ends at the destination.
    currentW = frames[departingLeg].w
    currentCenter = frames[departingLeg].end
  }

  const total = phases.reduce((sum, phase) => sum + phase.weight, 0)
  let accumulated = 0
  for (const phase of phases) {
    phase.p0 = accumulated / total
    accumulated += phase.weight
    phase.p1 = accumulated / total
  }

  return { phases, legWidths, frames, weight: total }
}

/**
 * Samples the timeline. The active route and the camera head are derived from
 * the same leg progress, so the line never appears to outrun its camera.
 */
export function sampleTimeline(timeline, p) {
  const { phases } = timeline
  const clamped = clamp(p, 0, 1)

  let i = 0
  while (i < phases.length - 1 && clamped >= phases[i].p1) i++
  const phase = phases[i]
  const span = phase.p1 - phase.p0
  const local = span > 0 ? (clamped - phase.p0) / span : 0

  let w
  let legT
  let cx
  let cy

  if (phase.kind === 'draw') {
    w = phase.w0
    legT = easeInOutSine(local)
    const center = trackingCenter(legs[phase.legIndex], legT)
    cx = center.cx
    cy = center.cy
  } else if (phase.kind === 'zoom') {
    const eased = easeInOutCubic(local)
    w = phase.w0 * Math.pow(phase.w1 / phase.w0, eased)
    legT = phase.legT
    cx = phase.cx0 + (phase.cx1 - phase.cx0) * eased
    cy = phase.cy0 + (phase.cy1 - phase.cy0) * eased
  } else {
    w = phase.w0
    legT = phase.legT
    cx = phase.cx
    cy = phase.cy
  }

  const legIndex = phase.legIndex
  const active = truncateLeg(legs[Math.max(0, legIndex)], legIndex < 0 ? 0 : legT)

  return {
    cx,
    cy,
    w: Math.max(MIN_W, w),
    legIndex,
    legT,
    phase: phase.kind,
    stopIndex: phase.stopIndex,
    active,
  }
}

/**
 * Returns the exact parked camera frame for a stop.
 *
 * This deliberately bypasses the scroll timeline's transition phases. A
 * chapter must finish at the arriving leg's endpoint and remain there until
 * the next command starts.
 */
export function parkedFrameForStop(timeline, stopIndex) {
  if (!timeline?.frames?.length) return null

  const incoming = stopIndex - 1
  const frame = timeline.frames[incoming >= 0 ? incoming : 0]
  const center = incoming >= 0 ? frame.end : frame.start

  return {
    cx: center.cx,
    cy: center.cy,
    w: frame.w,
    legIndex: incoming,
    legT: incoming >= 0 ? 1 : 0,
    phase: 'dwell',
    stopIndex,
    active: incoming >= 0 ? truncateLeg(legs[incoming], 1) : null,
  }
}

/**
 * Samples one complete leg as a single command-driven shot.
 *
 * The route and camera use the same local t. The camera starts at the exact
 * parked frame of the current stop, converges toward the next tracking shot
 * while the route is moving, and ends at the next destination frame. There
 * are no independent pre-departure or post-arrival phases.
 */
export function sampleLegTravel(timeline, legIndex, t, origin) {
  const leg = legs[legIndex]
  const target = timeline?.frames?.[legIndex]
  if (!leg || !target) return null

  const local = clamp(t, 0, 1)
  const routeT = easeInOutSine(local)
  const start = origin ?? {
    cx: target.start.cx,
    cy: target.start.cy,
    w: target.w,
  }
  const targetCenter = trackingCenter(leg, routeT)
  const cameraT = routeT

  return {
    cx: targetCenter.cx,
    cy: targetCenter.cy,
    w: start.w + (target.w - start.w) * cameraT,
    legIndex,
    legT: routeT,
    phase: 'draw',
    stopIndex: local >= 1 ? legIndex + 1 : legIndex,
    active: truncateLeg(leg, routeT),
  }
}

/** Scroll progress at which a stop is being dwelled on, used by the HUD. */
export function progressForStop(timeline, stopIndex) {
  const dwell = timeline.phases.find(
    (phase) => phase.kind === 'dwell' && phase.stopIndex === stopIndex
  )
  return dwell ? (dwell.p0 + dwell.p1) / 2 : 0
}
