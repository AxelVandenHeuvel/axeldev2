import { useMemo } from 'react'

import { landFine } from '../../data/europeMap.js'
import { destinations, legs, routeBounds, segmentPath, stops, transfers } from '../../lib/europeRoute.js'
import { GRAIN_URL, MOTTLE_URL, PAPER, ROUTE_STYLE, VIGNETTE } from './paper.js'

/**
 * The whole route in one fitted view, plus a plain list of stops.
 *
 * This carries three jobs at once: the prefers-reduced-motion rendering, the
 * manual "view as list" escape hatch, and the auto-degrade target when the
 * perf probe finds a device that can't hold frame rate. No rAF loop, no
 * sticky positioning, no scroll listener.
 */

export function StaticRouteMap({ onSelect }) {
  const view = useMemo(() => {
    // Crop the Atlantic leg out -- fitting Seattle would shrink Europe to
    // nothing. The journey list still covers it.
    const b = routeBounds(300)
    const minX = -5200
    return {
      viewBox: `${minX} ${b.minY} ${b.maxX - minX} ${b.maxY - b.minY}`,
      width: b.maxX - minX,
    }
  }, [])

  // Stroke widths are in user units here, sized off the fixed view width.
  const k = view.width / 1000

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: PAPER.base }}>
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundImage: MOTTLE_URL, opacity: 0.5 }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-14 sm:px-8">
        <div
          className="relative overflow-hidden"
          style={{ border: `1px solid ${PAPER.landEdge}55`, backgroundColor: PAPER.sea }}
        >
          <svg viewBox={view.viewBox} className="block h-auto w-full" role="img" aria-label="Route map of the 2026 Europe trip">
            <g fill={PAPER.land} stroke={PAPER.landEdge} strokeWidth={0.6 * k} strokeLinejoin="round">
              {landFine.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>

            <g stroke={PAPER.landEdge} strokeOpacity="0.5" strokeWidth={0.6 * k} fill="none">
              {transfers.map((t) => (
                <g key={t.slug}>
                  <line x1={t.x - 14} y1={t.y} x2={t.x + 14} y2={t.y} />
                  <line x1={t.x} y1={t.y - 14} x2={t.x} y2={t.y + 14} />
                </g>
              ))}
            </g>

            <g fill="none" strokeLinecap="round">
              {legs.map((leg) =>
                leg.segments.map((seg, j) => {
                  const style = ROUTE_STYLE[seg.mode] ?? ROUTE_STYLE.train
                  const d = segmentPath(seg)
                  return (
                    <g key={`${leg.index}-${j}`}>
                      {seg.mode === 'train' && (
                        <path d={d} stroke={style.color} strokeWidth={1.4 * k} strokeOpacity="0.8" />
                      )}
                      <path
                        d={d}
                        stroke={style.color}
                        strokeWidth={style.width * k}
                        strokeDasharray={style.dash.map((n) => n * k).join(' ')}
                      />
                    </g>
                  )
                })
              )}
            </g>

            <g>
              {stops.map((stop) => (
                <circle
                  key={stop.key}
                  cx={stop.x}
                  cy={stop.y}
                  r={(stop.origin ? 2.2 : 3.2) * k}
                  fill={PAPER.highlight}
                  stroke={stop.origin ? PAPER.landEdge : PAPER.pin}
                  strokeWidth={(stop.origin ? 1.2 : 1.8) * k}
                />
              ))}
            </g>
          </svg>

          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: GRAIN_URL, mixBlendMode: 'multiply', opacity: 0.24 }}
          />
          <div className="pointer-events-none absolute inset-0" style={{ background: VIGNETTE }} />
        </div>

        <ol className="mt-10 list-none p-0">
          {destinations.map((stop) => (
            <li key={stop.key}>
              <button
                type="button"
                onClick={() => onSelect(stop.index)}
                className="flex w-full items-baseline justify-between gap-4 border-t py-3.5 text-left transition-colors hover:bg-[#c4ad86]/25 focus:outline-none focus-visible:bg-[#c4ad86]/25"
                style={{ borderColor: `${PAPER.landEdge}44` }}
              >
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px]" style={{ color: PAPER.landEdge }}>
                    {String(stop.destIndex + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="text-base tracking-wide"
                    style={{ color: PAPER.inkDeep, fontFamily: 'Cinzel, serif' }}
                  >
                    {stop.name}
                  </span>
                </span>
                <span className="text-[11px]" style={{ color: PAPER.inkBody }}>
                  {stop.country}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
