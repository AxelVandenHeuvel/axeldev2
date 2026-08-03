import { forwardRef } from 'react'

import { destinations, stops } from '../../lib/europeRoute.js'
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

/**
 * Pin hit target.
 *
 * The button is a pill covering the dot AND its name, not a small box around
 * the dot alone -- the name is the thing that actually looks clickable, so it
 * ought to be. PIN_H is the pill's height and PIN_LEAD the distance from its
 * left edge to the centre of the dot; together they place the dot exactly on
 * the city while the rest of the target extends across the label.
 */
const PIN_H = 46
const PIN_LEAD = 18
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
      {stops.map((stop, i) =>
        // The origin anchors the route but isn't somewhere you can read about.
        stop.origin ? null : (
        <button
          key={stop.key}
          ref={(el) => (pinRefs.current[i] = el)}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`${stop.name}, ${stop.country} — stop ${stop.destIndex + 1} of ${destinations.length}`}
          className="eu-pin absolute left-0 top-0 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full pr-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{
            height: PIN_H,
            paddingLeft: PIN_LEAD - 5,
            // Places the centre of the dot, not the corner of the button, on
            // the city. The transform written each frame would override any
            // Tailwind -translate utility, so this is done with margins.
            marginLeft: -PIN_LEAD,
            marginTop: -PIN_H / 2,
            visibility: 'hidden',
          }}
        >
          <span className="eu-pin-dot block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#a8322a] bg-[#f2e8d0]" />
          <span
            className="eu-pin-label text-[11px] leading-none tracking-[0.12em]"
            style={{ fontFamily: '"IM Fell English SC", Cinzel, serif', color: PAPER.inkDeep }}
          >
            {stop.name}
          </span>
        </button>
        )
      )}

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
