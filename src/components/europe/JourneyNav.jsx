import { useEffect, useRef, useState } from 'react'

import { destinations } from '../../lib/europeRoute.js'
import { PAPER } from './paper.js'

/**
 * Discrete chapter controls for the Europe journey.
 *
 * Step controls stay at the top. The full index is an optional right drawer,
 * leaving the map unobstructed until the viewer explicitly asks for it.
 */
export function JourneyNav({
  selectedIndex,
  canPrevious = selectedIndex > 0,
  canNext = selectedIndex < destinations.length - 1,
  isAnimating = false,
  onSelect,
  onPrevious,
  onNext,
}) {
  const itemRefs = useRef([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  useEffect(() => {
    if (!expanded) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [expanded])

  return (
    <nav
      className="eu-journey-shell pointer-events-none absolute inset-0 z-40"
      aria-label="Europe 2026 journey chapters"
      aria-busy={isAnimating}
    >
      <div className="eu-journey-controls pointer-events-auto">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canPrevious || isAnimating}
          className="eu-journey-nav__step"
          style={{ color: PAPER.inkBody }}
        >
          ← previous
        </button>
        <button
          type="button"
          className="eu-journey-nav__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          index&nbsp; {String(selectedIndex + 1).padStart(2, '0')} / {destinations.length}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || isAnimating}
          className="eu-journey-nav__step"
          style={{ color: PAPER.inkBody }}
        >
          next →
        </button>
      </div>

      {expanded && <aside className="eu-journey-nav pointer-events-auto">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em]" style={{ color: PAPER.landEdge, fontFamily: '"IM Fell English SC", serif' }}>
            journey
          </p>
          <button type="button" className="eu-journey-nav__close" onClick={() => setExpanded(false)} aria-label="Close destination index">
            close ×
          </button>
        </div>
        <ol className="eu-journey-nav__list" aria-label="Stops">
        {destinations.map((stop, index) => {
          const selected = index === selectedIndex
          return (
            <li key={stop.key}>
              <button
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                type="button"
                aria-current={selected ? 'step' : undefined}
                onClick={() => {
                  onSelect(index)
                  setExpanded(false)
                }}
                className="eu-journey-nav__item group flex w-full items-baseline gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
                data-selected={selected ? 'true' : undefined}
              >
                <span className="eu-journey-nav__number font-mono text-[9px]" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="eu-journey-nav__name truncate">{stop.name}</span>
              </button>
            </li>
          )
        })}
        </ol>
      </aside>}
    </nav>
  )
}
