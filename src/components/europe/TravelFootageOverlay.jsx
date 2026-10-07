import { forwardRef } from 'react'

import { destinationClips, travelClips } from '../../data/europeMedia.js'

/**
 * Permanently mounted footage plates for the map cutscene.
 *
 * Europe2026Page drives opacity and playback from the selected chapter, so
 * this layer adds no scroll listener or independent animation timeline.
 */
export const TravelFootageOverlay = forwardRef(function TravelFootageOverlay(_, ref) {
  const clips = [...travelClips, ...destinationClips]
  return (
    <div ref={ref} className="eu-travel-footage pointer-events-none absolute inset-0" aria-hidden="true">
      {clips.map((clip) => (
        <video
          key={clip.id}
          data-travel-clip={clip.id}
          data-travel-mode={clip.mode}
          className="eu-travel-footage__clip absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          poster={clip.poster}
          src={clip.src}
        />
      ))}
      <div className="eu-travel-footage__wash absolute inset-0" />
    </div>
  )
})
