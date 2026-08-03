import { forwardRef, useMemo } from 'react'

import { landCoarse, landFine } from '../../data/europeMap.js'
import { legs, segmentPath, transfers } from '../../lib/europeRoute.js'
import { R, project } from '../../lib/projection.js'
import { PAPER, ROUTE_STYLE } from './paper.js'

/**
 * The animated map. Everything in here lives inside the scrubbing viewBox.
 *
 * Deliberately contains no filters -- see paper.js. Grain and vignette are
 * static sibling layers stacked on top by Europe2026Page.
 *
 * The parent drives this entirely through refs: viewBox on the <svg>, and
 * stroke-width / stroke-dasharray on the group refs. Nothing here re-renders
 * during scroll.
 */

const D = Math.PI / 180

/** In Mercator meridians are vertical and parallels horizontal, so this is free. */
function buildGraticule(spacingDeg) {
  const lines = []
  for (let lon = -180; lon <= 180; lon += spacingDeg) {
    const x = R * lon * D
    lines.push({ key: `m${lon}`, x1: x, y1: -22000, x2: x, y2: 22000 })
  }
  for (let lat = -80; lat <= 80; lat += spacingDeg) {
    const y = project(0, lat)[1]
    lines.push({ key: `p${lat}`, x1: -26000, y1: y, x2: 9000, y2: y })
  }
  return lines
}

/**
 * Portolan rhumb rosette. In Mercator a constant-bearing line genuinely IS
 * straight, so this is cartographically honest rather than decoration.
 */
function buildRhumbs(originLon, originLat, count = 32, length = 30000) {
  const [ox, oy] = project(originLon, originLat)
  return Array.from({ length: count }, (_, i) => {
    const a = (i * 360) / count
    return {
      key: `r${i}`,
      x1: ox,
      y1: oy,
      x2: ox + Math.cos(a * D) * length,
      y2: oy + Math.sin(a * D) * length,
    }
  })
}

export const MapStage = forwardRef(function MapStage(
  { fineRef, coarseRef, graticuleRef, rhumbRef, routeRef, headRefs, legRefs, mobile },
  svgRef
) {
  const graticules = useMemo(
    () => ({
      20: buildGraticule(20),
      10: buildGraticule(10),
      5: buildGraticule(5),
      2: buildGraticule(2),
    }),
    []
  )

  const rhumbs = useMemo(() => buildRhumbs(-28, 52), [])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x="-30000" y="-24000" width="60000" height="48000" fill={PAPER.sea} />

      {/* Rhumb rosette, faded out once the camera is inside Europe. */}
      {!mobile && (
        <g
          ref={rhumbRef}
          stroke={PAPER.graticule}
          strokeOpacity="0.22"
          fill="none"
          style={{ opacity: 0 }}
        >
          {rhumbs.map((l) => (
            <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
          ))}
        </g>
      )}

      {/* Four pre-built spacings; the parent toggles display by zoom tier. */}
      <g ref={graticuleRef} stroke={PAPER.graticule} strokeOpacity="0.3" fill="none">
        {Object.entries(graticules).map(([tier, lines]) => (
          <g key={tier} data-tier={tier} style={{ display: 'none' }}>
            {lines.map((l) => (
              <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
            ))}
          </g>
        ))}
      </g>

      {/* Coarse LOD: only ever visible during the Atlantic opening. */}
      <g ref={coarseRef} fill={PAPER.land} stroke={PAPER.landEdge} strokeLinejoin="round">
        {landCoarse.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Fine LOD: Europe. Shared borders draw twice, which reads as engraving. */}
      <g ref={fineRef} fill={PAPER.land} stroke={PAPER.landEdge} strokeLinejoin="round">
        {landFine.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      {/* Transfer ticks -- small crosses where a leg changes vehicle. */}
      <g stroke={PAPER.landEdge} strokeOpacity="0.5" fill="none">
        {transfers.map((t) => (
          <g key={t.slug}>
            <line x1={t.x - 14} y1={t.y} x2={t.x + 14} y2={t.y} />
            <line x1={t.x} y1={t.y - 14} x2={t.x} y2={t.y + 14} />
          </g>
        ))}
      </g>

      {/*
        One path per sub-segment (trains get a second, continuous underlay so
        the fat dashes on top read as sleepers). Each carries its complete
        geometry in data-full; the parent overwrites `d` only on the leg
        currently drawing, and restores it from data-full once that leg
        completes. Every other path is written once and never touched again.
      */}
      <g ref={routeRef} fill="none" strokeLinecap="round">
        {legs.map((leg) => (
          <g
            key={leg.index}
            ref={(el) => (legRefs.current[leg.index] = el)}
            style={{ display: 'none' }}
          >
            {leg.segments.map((seg, j) => {
              const style = ROUTE_STYLE[seg.mode] ?? ROUTE_STYLE.train
              const full = segmentPath(seg)
              return (
                <g key={j}>
                  {seg.mode === 'train' && (
                    <path
                      ref={(el) => {
                        const rails = (headRefs.current.rails[leg.index] ??= [])
                        rails[j] = el
                      }}
                      d={full}
                      data-full={full}
                      data-role="rail"
                      stroke={style.color}
                      strokeOpacity="0.8"
                    />
                  )}
                  <path
                    ref={(el) => {
                      const segs = (headRefs.current.segs[leg.index] ??= [])
                      segs[j] = el
                    }}
                    d={full}
                    data-full={full}
                    data-role="line"
                    data-mode={seg.mode}
                    stroke={style.color}
                  />
                </g>
              )
            })}
          </g>
        ))}
      </g>
    </svg>
  )
})
