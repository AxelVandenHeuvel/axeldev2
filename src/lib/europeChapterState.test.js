import assert from 'node:assert/strict'
import test from 'node:test'

import { footageForLeg } from '../data/europeMedia.js'
import { buildTimeline, sampleTimeline } from './europeCamera.js'
import {
  animationIntervals,
  chapterForDestination,
  destinationChapters,
  initialChapterState,
} from './europeChapterState.js'
import { destinations, legs, stops } from './europeRoute.js'

test('the journey begins at Seattle before the first destination chapter', () => {
  assert.deepEqual(initialChapterState(), {
    kind: 'origin',
    place: 'seattle',
    stopIndex: 0,
    destinationIndex: null,
    incomingLegIndex: null,
    outgoingLegIndex: 0,
    legT: 0,
  })

  const timeline = buildTimeline(1.6)
  const initial = sampleTimeline(timeline, 0)
  assert.equal(initial.phase, 'dwell')
  assert.equal(initial.stopIndex, 0)
  assert.equal(initial.legIndex, -1)
  assert.ok(initial.active.parts.every((part) => part === null))
})

test('every destination chapter maps to its incoming leg', () => {
  const chapters = destinationChapters()

  assert.equal(chapters.length, destinations.length)
  assert.equal(chapters[0].place, 'reykjavik')
  assert.equal(chapters.at(-1).place, 'boston')

  for (const [destinationIndex, chapter] of chapters.entries()) {
    const destination = destinations[destinationIndex]
    const incomingLeg = legs[chapter.incomingLegIndex]

    assert.equal(chapter.destinationIndex, destinationIndex)
    assert.equal(chapter.stopIndex, destination.index)
    assert.equal(chapter.place, destination.slug)
    assert.equal(incomingLeg.from, stops[destination.index - 1].slug)
    assert.equal(incomingLeg.to, destination.slug)
    assert.equal(chapter.legT, 1)
  }

  const pragueChapters = chapters.filter((chapter) => chapter.place === 'prague')
  assert.deepEqual(
    pragueChapters.map(({ stopIndex, incomingLegIndex }) => [stopIndex, incomingLegIndex]),
    [
      [7, 6],
      [15, 14],
    ]
  )
})

test('each leg has one ordered animation interval with stable boundaries', () => {
  const timeline = buildTimeline(1.6)
  const intervals = animationIntervals(timeline)

  assert.equal(intervals.length, legs.length)

  let previousEnd = 0
  for (const interval of intervals) {
    assert.ok(interval)
    assert.ok(interval.start >= previousEnd)
    assert.ok(interval.start < interval.end)
    assert.ok(interval.end <= 1)
    assert.ok(interval.weight > 0)

    const atStart = sampleTimeline(timeline, interval.start)
    const atEnd = sampleTimeline(timeline, interval.end)
    assert.equal(atStart.legIndex, interval.legIndex)
    assert.ok(Math.abs(atStart.legT) < 1e-12)
    assert.equal(atEnd.legIndex, interval.legIndex)
    assert.equal(atEnd.legT, 1)
    assert.ok(atEnd.active.parts.some(Boolean))

    previousEnd = interval.end
  }
})

test('chapter lookup rejects destinations outside the selectable range', () => {
  assert.equal(chapterForDestination(-1), null)
  assert.equal(chapterForDestination(destinations.length), null)
})

test('footage eligibility covers every long, brief, and short itinerary leg', () => {
  const expected = [
    'full',
    'full',
    'full',
    'full',
    null,
    null,
    'brief',
    'full',
    null,
    null,
    null,
    null,
    null,
    'full',
    'full',
    'full',
    null,
    'brief',
    'full',
    'brief',
    'full',
  ]

  assert.deepEqual(
    legs.map((leg) => footageForLeg(leg)?.treatment ?? null),
    expected
  )
})
