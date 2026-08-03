import { forwardRef } from 'react'

import { stops } from '../../lib/europeRoute.js'
import { GLYPH } from './glyphs.js'
import { PAPER } from './paper.js'

/**
 * Pins, labels, and the vehicle marker -- as HTML, not SVG.
 *
 * This is deliberate. Inside the scrubbing viewBox a pin's hit area would
 * shrink and grow across a 22x zoom range, and SVG <text> at those scales is
 * miserable to keep legible. Out here they're real <button>s: constant screen
 * size, keyboard focusable, Tab-ordered, and styleable with Tailwind.
 *
 * The parent repositions them each frame via transform. 21 style writes per
 * frame costs nothing.
 */

export const PinLayer = forwardRef(function PinLayer(
  { pinRefs, markerRef, markerGlyphRef, onSelect },
  overlayRef
) {
  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      data-settled="false"
    >
      {stops.map((stop, i) => (
        <button
          key={stop.key}
          ref={(el) => (pinRefs.current[i] = el)}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`${stop.name}, ${stop.country} — stop ${i + 1} of ${stops.length}`}
          className="eu-pin absolute left-0 top-0 flex origin-center -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-sm p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{ visibility: 'hidden' }}
        >
          <span className="eu-pin-dot relative block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#a8322a] bg-[#f2e8d0]" />
          <span
            className="eu-pin-label whitespace-nowrap text-[11px] leading-none tracking-[0.12em]"
            style={{ fontFamily: '"IM Fell English SC", Cinzel, serif', color: PAPER.inkDeep }}
          >
            {stop.name}
          </span>
        </button>
      ))}

      {/* The vehicle. Rides the head of the drawing line. */}
      <div
        ref={markerRef}
        className="absolute left-0 top-0 origin-center"
        style={{ visibility: 'hidden' }}
      >
        <svg
          ref={markerGlyphRef}
          width="30"
          height="30"
          viewBox="-14 -14 28 28"
          className="-translate-x-1/2 -translate-y-1/2 overflow-visible"
          aria-hidden="true"
        >
          <g data-role="glyph" fill={PAPER.inkDeep}>
            <path d={GLYPH.plane} />
          </g>
        </svg>
      </div>
    </div>
  )
})
