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
 * CENTRING, which is fiddly and was wrong before: the parent writes
 * `transform: translate3d(...)` on these elements every frame, which OVERRIDES
 * any Tailwind -translate-x-1/2 class rather than composing with it. So
 * centring is done with negative margins instead, and each element is a fixed
 * box whose middle is the anchor point. The marker additionally rotates, and
 * rotation pivots about the box centre -- which is only the glyph's centre
 * because the box is sized and offset to make it so.
 */

/** Hit target, comfortably over the 44px touch minimum. Also the rotation box. */
const PIN_BOX = 44
const MARKER_BOX = 34

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
          className="eu-pin absolute left-0 top-0 flex cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{
            width: PIN_BOX,
            height: PIN_BOX,
            marginLeft: -PIN_BOX / 2,
            marginTop: -PIN_BOX / 2,
            visibility: 'hidden',
          }}
        >
          {/* Centred in the box, so it lands exactly on the city. */}
          <span className="eu-pin-dot block h-2.5 w-2.5 rounded-full border-2 border-[#a8322a] bg-[#f2e8d0]" />
          <span
            className="eu-pin-label pointer-events-none absolute left-full top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] leading-none tracking-[0.12em]"
            style={{
              marginLeft: -PIN_BOX / 2 + 12,
              fontFamily: '"IM Fell English SC", Cinzel, serif',
              color: PAPER.inkDeep,
            }}
          >
            {stop.name}
          </span>
        </button>
      ))}

      {/*
        The vehicle. Rides the head of the drawing line.
        Fixed box, centred by margin, so `rotate()` pivots on the glyph's own
        centre and the nose stays on the line.
      */}
      <div
        ref={markerRef}
        className="eu-marker absolute left-0 top-0"
        style={{
          width: MARKER_BOX,
          height: MARKER_BOX,
          marginLeft: -MARKER_BOX / 2,
          marginTop: -MARKER_BOX / 2,
          visibility: 'hidden',
        }}
      >
        <svg
          ref={markerGlyphRef}
          width={MARKER_BOX}
          height={MARKER_BOX}
          viewBox="-14 -14 28 28"
          className="overflow-visible"
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
