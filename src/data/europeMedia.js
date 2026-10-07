/**
 * Licensed travel plates used by the discrete Europe journey chapters.
 *
 * Route lengths are projected map units, so the threshold is deliberately a
 * visual heuristic: hops shorter than 650 units do not earn footage. Mixed
 * legs are judged segment by segment, which keeps a short bus transfer from
 * borrowing train footage.
 */
export const FOOTAGE_MIN_LENGTH = 650
export const FOOTAGE_FULL_LENGTH = 1000
export const DESTINATION_ONLY_MAX_LENGTH = 1000

const FULL_OPACITY = 0.32
const BRIEF_OPACITY = 0.22
const PLACE_OPACITY = 0.3

function smoothstep(edge0, edge1, value) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * One continuous dissolve for every footage plate. It never exceeds half
 * opacity, and it fades over the whole leg rather than cutting when a mixed
 * train/bus route changes transport mode near its destination.
 */
export function footageOpacity(progress, treatment) {
  const t = Math.max(0, Math.min(1, progress))
  const fadeIn = smoothstep(0, 0.2, t)
  const fadeOut = 1 - smoothstep(0.76, 1, t)
  const peak = treatment === 'full' ? FULL_OPACITY : BRIEF_OPACITY
  return peak * fadeIn * fadeOut
}

/**
 * Split a chapter into an early transport plate and a later destination plate.
 * The small clear beat between them keeps the dissolve from looking like a
 * sudden exposure change when the source switches.
 */
export function sequencedFootageMix(progress) {
  const t = Math.max(0, Math.min(1, progress))
  const crossfade = smoothstep(0.44, 0.6, t)
  return {
    containerOpacity: PLACE_OPACITY * smoothstep(0.03, 0.14, t) * (1 - smoothstep(0.9, 1, t)),
    transportWeight: 1 - crossfade,
    destinationWeight: crossfade,
  }
}

export function destinationFootageOpacity(progress) {
  const t = Math.max(0, Math.min(1, progress))
  return PLACE_OPACITY * smoothstep(0, 0.18, t) * (1 - smoothstep(0.82, 1, t))
}

export const travelClips = [
  {
    id: 'plane-takeoff',
    mode: 'plane',
    src: '/video/europe2026/plane.mp4',
    poster: '/video/europe2026/plane-poster.jpg',
  },
  {
    id: 'plane-air',
    mode: 'plane',
    src: '/video/europe2026/plane-air.mp4',
    poster: '/video/europe2026/plane-air-poster.jpg',
  },
  {
    id: 'plane-clouds',
    mode: 'plane',
    src: '/video/europe2026/plane-clouds.mp4',
    poster: '/video/europe2026/plane-clouds-poster.jpg',
  },
  {
    id: 'train-alps',
    mode: 'train',
    src: '/video/europe2026/train.mp4',
    poster: '/video/europe2026/train-poster.jpg',
  },
  {
    id: 'train-river',
    mode: 'train',
    src: '/video/europe2026/train-river.mp4',
    poster: '/video/europe2026/train-river-poster.jpg',
  },
  {
    id: 'train-retro',
    mode: 'train',
    src: '/video/europe2026/train-retro.mp4',
    poster: '/video/europe2026/train-retro-poster.jpg',
  },
]

export const destinationClips = [
  {
    id: 'place-amsterdam',
    stopSlug: 'amsterdam',
    src: '/video/europe2026/place-amsterdam.mp4',
    poster: '/video/europe2026/place-amsterdam-poster.jpg',
  },
  {
    id: 'place-prague',
    stopSlug: 'prague',
    src: '/video/europe2026/place-prague.mp4',
    poster: '/video/europe2026/place-prague-poster.jpg',
  },
  {
    id: 'place-bled',
    stopSlug: 'bled',
    src: '/video/europe2026/place-bled.mp4',
    poster: '/video/europe2026/place-bled-poster.jpg',
  },
  {
    id: 'place-venice',
    stopSlug: 'venice',
    src: '/video/europe2026/place-venice.mp4',
    poster: '/video/europe2026/place-venice-poster.jpg',
  },
  {
    id: 'place-florence',
    stopSlug: 'florence',
    src: '/video/europe2026/place-florence.mp4',
    poster: '/video/europe2026/place-florence-poster.jpg',
  },
  {
    id: 'place-interlaken',
    stopSlug: 'interlaken',
    src: '/video/europe2026/place-interlaken.mp4',
    poster: '/video/europe2026/place-interlaken-poster.jpg',
  },
  {
    id: 'place-frankfurt',
    stopSlug: 'frankfurt',
    src: '/video/europe2026/place-frankfurt.mp4',
    poster: '/video/europe2026/place-frankfurt-poster.jpg',
  },
]

const destinationClipBySlug = new Map(destinationClips.map((clip) => [clip.stopSlug, clip]))

export function footageForDestination(stop) {
  const clip = destinationClipBySlug.get(stop?.slug)
  return clip ? { clipId: clip.id, mode: 'destination', treatment: 'place' } : null
}

export function footagePlanForLeg(leg, destinationStop) {
  const destination = footageForDestination(destinationStop)
  const transport = destination && leg?.length < DESTINATION_ONLY_MAX_LENGTH
    ? null
    : footageForLeg(leg)
  return { transport, destination }
}

const clipPools = {
  plane: ['plane-clouds', 'plane-air', 'plane-takeoff'],
  train: ['train-alps', 'train-river', 'train-retro'],
}

export function footageForLeg(leg) {
  if (!leg) return null

  const segment = leg.segments
    .filter(({ mode, length }) => (mode === 'plane' || mode === 'train') && length >= FOOTAGE_MIN_LENGTH)
    .sort((a, b) => b.length - a.length)[0]

  if (!segment) return null
  const pool = clipPools[segment.mode]
  return {
    clipId: pool[leg.index % pool.length],
    mode: segment.mode,
    treatment: segment.length >= FOOTAGE_FULL_LENGTH ? 'full' : 'brief',
  }
}
