import { useEffect, useRef } from 'react'

import { stops } from '../../lib/europeRoute.js'
import { GRAIN_URL, PAPER } from './paper.js'

/**
 * The field journal. Opens over the map on pin click.
 *
 * Locks body scroll by position:fixed rather than overflow:hidden, because
 * overflow:hidden alone doesn't hold on iOS, and restores the exact scroll
 * offset on close so the cutscene doesn't jump.
 */

const MODE_LABEL = {
  plane: 'by air',
  train: 'by rail',
  bus: 'by road',
  multi: 'by rail and road',
}

export function JournalModal({ stopIndex, onClose, onStep }) {
  const closeRef = useRef(null)
  const scrollYRef = useRef(0)
  const open = stopIndex !== null

  useEffect(() => {
    if (!open) return

    scrollYRef.current = window.scrollY
    const body = document.body
    // Keep the scrollbar gutter so locking doesn't shift the layout underneath.
    body.style.overflowY = 'scroll'
    body.style.position = 'fixed'
    body.style.top = `-${scrollYRef.current}px`
    body.style.width = '100%'

    closeRef.current?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)

    return () => {
      body.style.overflowY = ''
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      window.scrollTo(0, scrollYRef.current)
      window.removeEventListener('keydown', onKey)
    }
    // Re-running on stopIndex would re-lock and lose the saved offset.
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  const stop = stops[stopIndex]
  const arrive = stop.arriveBy ? MODE_LABEL[stop.arriveBy] : null
  const depart = stop.departBy ? MODE_LABEL[stop.departBy] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${stop.name} journal entry`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#2a1d10]/50 backdrop-blur-[2px]"
      />

      <div
        className="eu-journal relative flex max-h-[88svh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl sm:max-h-[85svh] sm:rounded-sm"
        style={{ backgroundColor: PAPER.highlight, overscrollBehaviorY: 'contain' }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.22]"
          style={{ backgroundImage: GRAIN_URL, mixBlendMode: 'multiply' }}
        />
        <div
          className="pointer-events-none absolute inset-2 z-10 border"
          style={{ borderColor: `${PAPER.landEdge}66` }}
        />

        <header className="relative shrink-0 px-6 pb-4 pt-6 sm:px-9 sm:pt-8">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close journal"
            className="absolute right-4 top-4 z-20 px-2 py-1 text-lg leading-none transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a] sm:right-6 sm:top-6"
            style={{ color: PAPER.inkBody }}
          >
            ×
          </button>

          <p
            className="text-[10px] uppercase tracking-[0.32em]"
            style={{ color: PAPER.landEdge, fontFamily: '"IM Fell English SC", serif' }}
          >
            stop {stopIndex + 1} of {stops.length}
            {stop.visit === 2 && ' · second visit'}
          </p>

          <h2
            className="mt-2 text-3xl leading-none tracking-wide sm:text-4xl"
            style={{ color: PAPER.inkDeep, fontFamily: 'Cinzel, serif' }}
          >
            {stop.name}
          </h2>

          <p className="mt-2 text-xs tracking-wide" style={{ color: PAPER.inkBody }}>
            {stop.country}
            {arrive && <span> · arrived {arrive}</span>}
            {depart && <span> · left {depart}</span>}
          </p>
        </header>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pb-8 sm:px-9">
          <div
            className="mb-6 h-px w-full"
            style={{ backgroundColor: `${PAPER.landEdge}55` }}
          />

          {stop.blurb ? (
            <p
              className="whitespace-pre-line text-sm leading-relaxed"
              style={{ color: PAPER.inkBody, fontFamily: '"Special Elite", monospace' }}
            >
              {stop.blurb}
            </p>
          ) : (
            <p
              className="text-sm italic leading-relaxed"
              style={{ color: `${PAPER.inkBody}99`, fontFamily: '"Special Elite", monospace' }}
            >
              No notes yet.
            </p>
          )}

          {stop.photos.length > 0 ? (
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stop.photos.map((photo, i) => (
                <figure key={i} className="m-0">
                  <img
                    src={photo.src}
                    alt={photo.caption || `${stop.name} photograph ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    width={photo.width ?? 1400}
                    height={photo.height ?? 933}
                    className="h-auto w-full bg-[#dcd0b4]"
                    style={{ border: `1px solid ${PAPER.landEdge}44` }}
                  />
                  {photo.caption && (
                    <figcaption
                      className="mt-1.5 text-[11px]"
                      style={{ color: PAPER.landEdge }}
                    >
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            /* Placeholder rather than an empty grid, so a photo-less stop still
               looks intentional while the trip's photos get added. */
            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="aspect-[4/3] w-full"
                  style={{
                    backgroundColor: `${PAPER.shadow}55`,
                    border: `1px dashed ${PAPER.landEdge}55`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <footer
          className="relative flex shrink-0 items-center justify-between border-t px-6 py-3 sm:px-9"
          style={{ borderColor: `${PAPER.landEdge}44` }}
        >
          <button
            type="button"
            onClick={() => onStep(-1)}
            disabled={stopIndex === 0}
            className="px-2 py-1 text-xs tracking-wide transition-opacity hover:opacity-60 disabled:pointer-events-none disabled:opacity-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
            style={{ color: PAPER.inkBody, fontFamily: '"IM Fell English SC", serif' }}
          >
            ← previous
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            disabled={stopIndex === stops.length - 1}
            className="px-2 py-1 text-xs tracking-wide transition-opacity hover:opacity-60 disabled:pointer-events-none disabled:opacity-25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
            style={{ color: PAPER.inkBody, fontFamily: '"IM Fell English SC", serif' }}
          >
            next →
          </button>
        </footer>
      </div>
    </div>
  )
}
