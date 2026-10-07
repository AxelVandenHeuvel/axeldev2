import { destinations, legs, stops } from './europeRoute.js'

/**
 * Describes the state before the first destination chapter is activated.
 *
 * Seattle is the origin, not a selectable destination. The first Next action
 * therefore starts leg zero at its geographic origin and reveals Reykjavík as
 * the first destination chapter when the animation completes.
 */
export function initialChapterState() {
  const origin = stops.find((stop) => stop.origin)
  const outgoingLegIndex = legs.findIndex((leg) => leg.from === origin?.slug)

  return {
    kind: 'origin',
    place: origin?.slug ?? null,
    stopIndex: origin?.index ?? null,
    destinationIndex: null,
    incomingLegIndex: null,
    outgoingLegIndex: outgoingLegIndex >= 0 ? outgoingLegIndex : null,
    legT: 0,
  }
}

/**
 * Resolves a selectable destination chapter to the leg that arrives there.
 *
 * Keeping this relationship in one pure helper makes repeated places such as
 * Prague remain separate chapters while still sharing their place metadata.
 */
export function chapterForDestination(destinationIndex) {
  const destination = destinations[destinationIndex]
  if (!destination) return null

  const incomingLegIndex = destination.index - 1
  const incomingLeg = legs[incomingLegIndex]
  if (!incomingLeg || incomingLeg.to !== destination.slug) {
    throw new Error(`No incoming leg for destination chapter ${destinationIndex}`)
  }

  return {
    kind: 'destination',
    place: destination.slug,
    stopIndex: destination.index,
    destinationIndex,
    incomingLegIndex,
    legT: 1,
  }
}

/** Resolve every selectable destination chapter in itinerary order. */
export function destinationChapters() {
  return destinations.map((_, index) => chapterForDestination(index))
}

/**
 * Returns the normalized progress interval occupied by one leg's draw phase.
 * The interval is derived from the camera timeline, so route animation and
 * camera framing share the exact same boundaries.
 */
export function animationIntervalForLeg(timeline, legIndex) {
  const phase = timeline?.phases?.find(
    (candidate) => candidate.kind === 'draw' && candidate.legIndex === legIndex
  )
  if (!phase) return null

  return {
    legIndex,
    start: phase.p0,
    end: phase.p1,
    weight: phase.weight,
  }
}

/** Resolve all leg draw intervals in route order. */
export function animationIntervals(timeline) {
  return legs.map((_, index) => animationIntervalForLeg(timeline, index))
}
