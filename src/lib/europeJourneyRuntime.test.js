import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildTimeline,
  parkedFrameForStop,
  sampleLegTravel,
} from './europeCamera.js'
import { legs, stops } from './europeRoute.js'

const ASPECTS = [1.6, 1, 0.75]
const EPSILON = 1e-8

function assertCameraEqual(actual, expected, message) {
  assert.ok(Math.abs(actual.cx - expected.cx) < EPSILON, `${message}: cx`)
  assert.ok(Math.abs(actual.cy - expected.cy) < EPSILON, `${message}: cy`)
  assert.ok(Math.abs(actual.w - expected.w) < EPSILON, `${message}: width`)
}

test('every leg starts from the exact parked arrival frame before it', () => {
  for (const aspect of ASPECTS) {
    const timeline = buildTimeline(aspect)

    for (let legIndex = 0; legIndex < legs.length; legIndex++) {
      const origin = parkedFrameForStop(timeline, legIndex)
      const firstFrame = sampleLegTravel(timeline, legIndex, 0, origin)

      assert.ok(origin, `aspect ${aspect}, leg ${legIndex} has no origin frame`)
      assert.equal(origin.stopIndex, legIndex)
      assertCameraEqual(
        firstFrame,
        origin,
        `aspect ${aspect}, leg ${legIndex} camera handoff`
      )
      assert.equal(firstFrame.legIndex, legIndex)
      assert.ok(Math.abs(firstFrame.legT) < EPSILON)
      assert.ok(firstFrame.active.parts.every((part) => part === null))
    }
  }
})

test('route progress begins in the first travel frame without a setup-only phase', () => {
  const timeline = buildTimeline(1.6)

  for (let legIndex = 0; legIndex < legs.length; legIndex++) {
    const origin = parkedFrameForStop(timeline, legIndex)
    const firstMovingFrame = sampleLegTravel(timeline, legIndex, 0.01, origin)

    assert.ok(
      firstMovingFrame.active.parts.some(Boolean),
      `leg ${legIndex} has no route immediately after departure`
    )
    assert.ok(firstMovingFrame.legT > 0, `leg ${legIndex} did not advance route progress`)
  }
})

test('the moving route head and destination stay centered throughout every leg', () => {
  for (const aspect of ASPECTS) {
    const timeline = buildTimeline(aspect)

    for (let legIndex = 0; legIndex < legs.length; legIndex++) {
      const origin = parkedFrameForStop(timeline, legIndex)
      for (const progress of [0, 0.1, 0.35, 0.65, 0.9, 1]) {
        const frame = sampleLegTravel(timeline, legIndex, progress, origin)
        assert.ok(frame.active?.head, `aspect ${aspect}, leg ${legIndex} has no route head`)
        assert.ok(
          Math.abs(frame.cx - frame.active.head.x) < EPSILON,
          `aspect ${aspect}, leg ${legIndex}, progress ${progress}: route head x is off-center`
        )
        assert.ok(
          Math.abs(frame.cy - frame.active.head.y) < EPSILON,
          `aspect ${aspect}, leg ${legIndex}, progress ${progress}: route head y is off-center`
        )
      }
    }
  }
})

test('each arrival is a stable parked frame until the next command', () => {
  for (const aspect of ASPECTS) {
    const timeline = buildTimeline(aspect)

    for (let legIndex = 0; legIndex < legs.length; legIndex++) {
      const origin = parkedFrameForStop(timeline, legIndex)
      const arrival = sampleLegTravel(timeline, legIndex, 1, origin)
      const parkedArrival = parkedFrameForStop(timeline, legIndex + 1)

      assertCameraEqual(
        arrival,
        parkedArrival,
        `aspect ${aspect}, leg ${legIndex} arrival`
      )
      assert.equal(parkedArrival.phase, 'dwell')
      assert.equal(parkedArrival.stopIndex, legIndex + 1)
      assert.equal(parkedArrival.legIndex, legIndex)
      assert.ok(Math.abs(parkedArrival.legT - 1) < EPSILON)
      assert.ok(parkedArrival.active.parts.every(Boolean))

      const repeatedParkedArrival = parkedFrameForStop(timeline, legIndex + 1)
      assertCameraEqual(
        repeatedParkedArrival,
        parkedArrival,
        `aspect ${aspect}, leg ${legIndex} parked stability`
      )
    }
  }
})

test('initial autoplay is deterministic from Seattle to Reykjavík', () => {
  const timeline = buildTimeline(1.6)
  const initial = parkedFrameForStop(timeline, 0)
  const firstLeg = sampleLegTravel(timeline, 0, 0, initial)
  const firstArrival = sampleLegTravel(timeline, 0, 1, initial)

  assert.equal(stops[0].slug, 'seattle')
  assert.equal(stops[1].slug, 'reykjavik')
  assert.equal(initial.stopIndex, 0)
  assert.equal(initial.legIndex, -1)
  assert.equal(initial.legT, 0)
  assert.equal(firstLeg.legIndex, 0)
  assert.ok(Math.abs(firstLeg.legT) < EPSILON)
  assert.equal(firstArrival.legIndex, 0)
  assert.equal(firstArrival.legT, 1)
  assert.ok(firstArrival.active.parts.every(Boolean))

  const repeat = sampleLegTravel(timeline, 0, 1, initial)
  assertCameraEqual(repeat, firstArrival, 'initial autoplay repeatability')
})
