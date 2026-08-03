import { forwardRef, useState } from 'react'

import { destinations } from '../../lib/europeRoute.js'
import { PAPER } from './paper.js'

/**
 * Chrome over the map: back link, current chapter, progress rail, stop index.
 *
 * The index matters for more than navigation -- it's the guarantee that pins
 * are never the only way to reach a journal entry, which keeps the page usable
 * when the camera is moving and on touch devices with no hover.
 */

export const ChapterHud = forwardRef(function ChapterHud(
  { onBack, onJump, onOpen, onToggleStatic, isStatic, chapterRef, counterRef, railRef },
  ref
) {
  const [indexOpen, setIndexOpen] = useState(false)

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-4 sm:left-6 sm:top-6">
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-xs transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{ color: PAPER.inkBody }}
        >
          ← back
        </button>
      </div>

      <div className="pointer-events-auto absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-6">
        <button
          type="button"
          onClick={onToggleStatic}
          aria-pressed={isStatic}
          className="font-mono text-[11px] transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{ color: PAPER.inkBody }}
        >
          {isStatic ? 'play cutscene' : 'view as list'}
        </button>
        <button
          type="button"
          onClick={() => setIndexOpen((v) => !v)}
          aria-expanded={indexOpen}
          className="font-mono text-[11px] transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{ color: PAPER.inkBody }}
        >
          {indexOpen ? 'close index' : 'index'}
        </button>
      </div>

      {/* Chapter title, bottom-left. Updated by ref, not by re-render. */}
      {!isStatic && (
        <div className="absolute bottom-6 left-4 max-w-[70%] sm:bottom-9 sm:left-8">
          <p
            ref={counterRef}
            className="text-[10px] uppercase tracking-[0.32em]"
            style={{ color: PAPER.landEdge, fontFamily: '"IM Fell English SC", serif' }}
          />
          <h2
            ref={chapterRef}
            className="mt-1 text-2xl leading-none tracking-wide sm:text-4xl"
            style={{ color: PAPER.inkDeep, fontFamily: 'Cinzel, serif' }}
          />
        </div>
      )}

      {/* Progress rail: one tick per stop, filling as the journey advances. */}
      {!isStatic && (
        <div className="pointer-events-auto absolute bottom-6 right-4 sm:bottom-9 sm:right-8">
          <div ref={railRef} className="flex flex-col items-end gap-[5px]">
            {destinations.map((stop) => (
              <button
                key={stop.key}
                type="button"
                onClick={() => onJump(stop.index)}
                aria-label={`Jump to ${stop.name}`}
                className="group flex items-center gap-2 focus:outline-none"
                data-rail-tick={stop.destIndex}
              >
                <span
                  className="hidden text-[10px] tracking-wider opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:inline"
                  style={{ color: PAPER.inkBody, fontFamily: '"IM Fell English SC", serif' }}
                >
                  {stop.name}
                </span>
                <span
                  className="block h-px transition-all"
                  data-rail-bar
                  style={{ width: 14, backgroundColor: `${PAPER.landEdge}66` }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/*
        The index panel's background lives on the scrolling element itself.
        It used to be an `absolute inset-0` child, which sizes to the
        container's visible box rather than its scroll content -- so once the
        list outgrew the panel, the last few stops rendered past the bottom of
        their own backdrop.

        Height is capped against the viewport rather than a flat 70svh, so the
        panel can't run off the bottom of the screen however many stops the
        itinerary grows to.
      */}
      {indexOpen && (
        <div
          data-index-panel
          className="pointer-events-auto absolute right-4 top-14 z-40 w-56 overflow-y-auto rounded-sm p-3 shadow-xl sm:right-6 sm:top-16"
          style={{
            maxHeight: 'calc(100svh - 6rem)',
            backgroundColor: PAPER.highlight,
            border: `1px solid ${PAPER.landEdge}55`,
            overscrollBehavior: 'contain',
          }}
        >
          {destinations.map((stop) => (
            <button
              key={stop.key}
              type="button"
              onClick={() => {
                setIndexOpen(false)
                onOpen(stop.index)
              }}
              className="flex w-full items-baseline justify-between gap-3 px-2 py-1.5 text-left transition-colors hover:bg-[#c4ad86]/30 focus:outline-none focus-visible:bg-[#c4ad86]/30"
            >
              <span
                className="text-xs tracking-wide"
                style={{ color: PAPER.inkDeep, fontFamily: '"IM Fell English SC", serif' }}
              >
                {stop.name}
              </span>
              <span className="font-mono text-[10px]" style={{ color: PAPER.landEdge }}>
                {String(stop.destIndex + 1).padStart(2, '0')}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})
