import assert from 'node:assert/strict'
import test from 'node:test'

import { legs } from '../lib/europeRoute.js'
import {
  destinationFootageOpacity,
  footageForDestination,
  footageForLeg,
  footageOpacity,
  footagePlanForLeg,
  sequencedFootageMix,
} from './europeMedia.js'

test('short ground hops and buses remain map-only', () => {
  for (const index of [4, 5, 8, 9, 10, 11, 12, 16]) {
    assert.equal(footageForLeg(legs[index]), null, `leg ${index} unexpectedly has footage`)
  }
})

test('long journeys rotate deterministic plane and train footage', () => {
  assert.deepEqual(footageForLeg(legs[0]), {
    clipId: 'plane-clouds',
    mode: 'plane',
    treatment: 'full',
  })
  assert.deepEqual(footageForLeg(legs[2]), {
    clipId: 'train-retro',
    mode: 'train',
    treatment: 'full',
  })
  assert.equal(footageForLeg(legs[19]).treatment, 'brief')
})

test('mixed legs use their qualifying segment instead of their arrival mode', () => {
  assert.equal(legs[7].mode, 'bus')
  assert.equal(footageForLeg(legs[7]).mode, 'train')
})

test('footage thresholds are inclusive at the brief and full boundaries', () => {
  const leg = (index, mode, length) => ({
    index,
    segments: [{ mode, length }],
  })

  assert.equal(footageForLeg(leg(0, 'train', 649.99)), null)
  assert.equal(footageForLeg(leg(0, 'train', 650)).treatment, 'brief')
  assert.equal(footageForLeg(leg(1, 'plane', 999.99)).treatment, 'brief')
  assert.equal(footageForLeg(leg(1, 'plane', 1000)).treatment, 'full')
})

test('footage uses one bounded continuous dissolve curve', () => {
  assert.equal(footageOpacity(0, 'full'), 0)
  assert.equal(footageOpacity(1, 'full'), 0)
  assert.equal(footageOpacity(-1, 'full'), 0)
  assert.equal(footageOpacity(2, 'full'), 0)
  assert.equal(footageOpacity(0.5, 'full'), 0.32)
  assert.equal(footageOpacity(0.5, 'brief'), 0.22)

  let previous = footageOpacity(0, 'full')
  for (let i = 1; i <= 100; i++) {
    const opacity = footageOpacity(i / 100, 'full')
    assert.ok(opacity >= 0 && opacity <= 0.32)
    assert.ok(Math.abs(opacity - previous) < 0.04, `opacity jumped at ${i / 100}`)
    previous = opacity
  }
})

test('destination footage is used only for exact sourced stops', () => {
  assert.equal(footageForDestination({ slug: 'amsterdam' }).clipId, 'place-amsterdam')
  assert.equal(footageForDestination({ slug: 'interlaken' }).clipId, 'place-interlaken')
  assert.equal(footageForDestination({ slug: 'bovec' }), null)
  assert.equal(footageForDestination(null), null)
})

test('transport crossfades directly into destination at constant exposure', () => {
  for (let i = 45; i <= 59; i++) {
    const mix = sequencedFootageMix(i / 100)
    assert.ok(mix.transportWeight > 0)
    assert.ok(mix.destinationWeight > 0)
    assert.ok(Math.abs(mix.transportWeight + mix.destinationWeight - 1) < 1e-9)
    assert.equal(mix.containerOpacity, 0.3)
  }

  assert.deepEqual(sequencedFootageMix(0.4), {
    containerOpacity: 0.3,
    transportWeight: 1,
    destinationWeight: 0,
  })
  assert.deepEqual(sequencedFootageMix(0.7), {
    containerOpacity: 0.3,
    transportWeight: 0,
    destinationWeight: 1,
  })
})

test('short journeys use destination footage without transport', () => {
  for (const index of [6, 8, 9, 10, 19]) {
    const plan = footagePlanForLeg(legs[index], { slug: ['prague', 'bled', 'venice', 'florence', 'interlaken'][[6, 8, 9, 10, 19].indexOf(index)] })
    assert.equal(plan.transport, null, `leg ${index} unexpectedly retained transport`)
    assert.ok(plan.destination)
  }

  const longPlan = footagePlanForLeg(legs[1], { slug: 'amsterdam' })
  assert.equal(longPlan.transport.mode, 'plane')
  assert.equal(longPlan.destination.clipId, 'place-amsterdam')
  assert.equal(destinationFootageOpacity(0), 0)
  assert.equal(destinationFootageOpacity(0.5), 0.3)
  assert.equal(destinationFootageOpacity(1), 0)
})
