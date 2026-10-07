import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildTimeline,
  parkedFrameForStop,
  sampleLegTravel,
  sampleTimeline,
} from './europeCamera.js'
import { legs, stops } from './europeRoute.js'

const EPSILON = 1e-8

function drawPhase(timeline, legIndex) {
  return timeline.phases.find(
    (phase) => phase.kind === 'draw' && phase.legIndex === legIndex
  )
}

test('camera handoffs are continuous at every leg boundary', () => {
  const timeline = buildTimeline(1.6)

  for (let i = 0; i < timeline.phases.length - 1; i++) {
    const phase = timeline.phases[i]
    const next = timeline.phases[i + 1]
    const before = sampleTimeline(timeline, Math.max(0, phase.p1 - EPSILON))
    const atBoundary = sampleTimeline(timeline, phase.p1)

    assert.ok(
      Math.abs(atBoundary.cx - before.cx) < 1,
      `camera x jumps at phase ${i}: ${phase.kind} -> ${next.kind}`
    )
    assert.ok(
      Math.abs(atBoundary.cy - before.cy) < 1,
      `camera y jumps at phase ${i}: ${phase.kind} -> ${next.kind}`
    )
    assert.ok(
      Math.abs(atBoundary.w - before.w) < 1,
      `camera width jumps at phase ${i}: ${phase.kind} -> ${next.kind}`
    )
  }
})

test('a completed leg remains the active route through its arrival handoff', () => {
  const timeline = buildTimeline(1.6)

  for (let legIndex = 0; legIndex < legs.length; legIndex++) {
    const draw = drawPhase(timeline, legIndex)
    const phaseIndex = timeline.phases.indexOf(draw)
    const next = timeline.phases[phaseIndex + 1]
    const atArrival = sampleTimeline(timeline, draw.p1)

    assert.equal(next.kind, 'dwell')
    assert.equal(next.legIndex, legIndex)
    assert.equal(atArrival.legIndex, legIndex)
    assert.equal(atArrival.legT, 1)
    assert.ok(atArrival.active.parts.some(Boolean), `leg ${legIndex} has no arrival route`)
  }
})

test('parked frames keep the previous route until the next draw starts', () => {
  const timeline = buildTimeline(1.6)

  for (let stopIndex = 1; stopIndex < stops.length - 1; stopIndex++) {
    const draw = drawPhase(timeline, stopIndex)
    const phaseIndex = timeline.phases.indexOf(draw)
    const previous = timeline.phases[phaseIndex - 1]

    assert.ok(previous.kind === 'dwell' || previous.kind === 'zoom')
    assert.equal(previous.legIndex, stopIndex - 1)
    assert.equal(previous.legT, 1)
  }
})

test('long tracking shots receive enough scroll weight for their screen travel', () => {
  const timeline = buildTimeline(1.6)
  const opening = drawPhase(timeline, 0)
  const final = drawPhase(timeline, legs.length - 1)

  assert.ok(opening.weight > legs[0].length / timeline.legWidths[0])
  assert.ok(final.weight > legs.at(-1).length / timeline.legWidths.at(-1))
})

test('command-driven leg travel has no post-arrival camera phase', () => {
  const timeline = buildTimeline(1.6)

  for (let legIndex = 0; legIndex < legs.length; legIndex++) {
    const origin = parkedFrameForStop(timeline, legIndex)
    const arrival = sampleLegTravel(timeline, legIndex, 1, origin)
    const parked = parkedFrameForStop(timeline, legIndex + 1)

    assert.equal(arrival.stopIndex, legIndex + 1)
    assert.equal(arrival.legT, 1)
    assert.equal(arrival.phase, 'draw')
    assert.ok(Math.abs(arrival.cx - parked.cx) < EPSILON)
    assert.ok(Math.abs(arrival.cy - parked.cy) < EPSILON)
    assert.ok(Math.abs(arrival.w - parked.w) < EPSILON)
    assert.ok(arrival.active.parts.some(Boolean), `leg ${legIndex} did not reach its stop`)
  }
})

test('a next leg starts at the exact prior arrival frame', () => {
  const timeline = buildTimeline(1.6)
  const previousArrival = parkedFrameForStop(timeline, 1)
  const nextStart = sampleLegTravel(timeline, 1, 0, previousArrival)

  assert.deepEqual(
    { cx: nextStart.cx, cy: nextStart.cy, w: nextStart.w },
    { cx: previousArrival.cx, cy: previousArrival.cy, w: previousArrival.w }
  )
  assert.ok(nextStart.active.parts.every((part) => part === null))
})
