import { forwardRef, useEffect, useMemo } from 'react'

import { landCoarse, landFine } from '../../data/europeMap.js'
import { legs, segmentPath } from '../../lib/europeRoute.js'
import { R, project } from '../../lib/projection.js'
import { PAPER, ROUTE } from './paper.js'

/**
 * The map stage. Everything in here lives inside the selected chapter viewBox.
 *
 * Deliberately contains no filters -- see paper.js. Grain and vignette are
 * static sibling layers stacked on top by Europe2026Page.
 *
 * The parent drives this entirely through refs: viewBox on the <svg>, and
 * stroke-width / stroke-dasharray on the group refs. Nothing here re-renders
 * during scroll.
 */

const D = Math.PI / 180

const COUNTRY_LABELS = [
  ['CANADA', -106, 57],
  ['UNITED STATES', -102, 39],
  ['ICELAND', -18.7, 64.9],
  ['IRELAND', -8.1, 53.3],
  ['UNITED KINGDOM', -3.2, 55.1],
  ['PORTUGAL', -8.1, 39.6],
  ['SPAIN', -3.7, 40.2],
  ['FRANCE', 2.1, 46.4],
  ['BELGIUM', 4.6, 50.7],
  ['NETHERLANDS', 5.3, 53.15],
  ['GERMANY', 10.3, 51.1],
  ['DENMARK', 9.3, 56.1],
  ['NORWAY', 8.4, 61.5],
  ['SWEDEN', 15.1, 62.2],
  ['FINLAND', 26, 64.5],
  ['SWITZERLAND', 9.1, 47.15],
  ['AUSTRIA', 14.5, 46.95],
  ['ITALY', 12.4, 42.7],
  ['CZECHIA', 16.2, 49.35],
  ['POLAND', 19.1, 52],
  ['SLOVAKIA', 18.55, 48.75],
  ['SLOVENIA', 15.25, 45.75],
  ['CROATIA', 16.4, 44.8],
  ['HUNGARY', 21, 47],
  ['BOSNIA', 17.8, 44.1],
  ['SERBIA', 20.8, 44],
  ['ROMANIA', 25, 45.8],
  ['UKRAINE', 31.3, 49],
].map(([name, lon, lat]) => {
  const [x, y] = project(lon, lat)
  return { name, x, y }
})

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

export const MapStage = forwardRef(function MapStage(
  {
    fineRef, coarseRef, fineShadowRef, coarseShadowRef, graticuleRef,
    countryLabelRef, routeRef, headRefs, legRefs,
  },
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

  // Route geometry is mutated through refs when a chapter is selected. Clear a leg's
  // partial path as soon as its group becomes hidden so a later group switch
  // can never expose the previous frame's geometry for one paint.
  useEffect(() => {
    const groups = legRefs.current.filter(Boolean)
    const clearHiddenGeometry = (group) => {
      if (group.style.display !== 'none') return
      group.querySelectorAll('path[data-route-layer]').forEach((path) => {
        path.style.display = 'none'
        path.setAttribute('d', '')
      })
    }

    groups.forEach(clearHiddenGeometry)

    if (typeof MutationObserver === 'undefined') return undefined

    const observers = groups.map((group) => {
      const observer = new MutationObserver(() => clearHiddenGeometry(group))
      observer.observe(group, { attributes: true, attributeFilter: ['style'] })
      return observer
    })

    return () => observers.forEach((observer) => observer.disconnect())
  }, [legRefs])

  return (
    <svg
      ref={svgRef}
      className="eu-map absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* A small, repeatable fiber pattern gives the map a printed stock
            feel without putting a turbulence filter on the animated root. */}
        <pattern id="eu-paper-fiber" width="180" height="180" patternUnits="userSpaceOnUse">
          <path d="M8 36L78 28M102 120L166 132M36 164L112 154" stroke={PAPER.fiber} strokeOpacity="0.22" strokeWidth="2" />
          <path d="M22 88L60 92M128 52L174 46M78 18L92 62" stroke={PAPER.fiber} strokeOpacity="0.14" strokeWidth="1" />
          <path d="M0 71C42 66 93 78 180 69M0 143C61 137 121 148 180 141" stroke={PAPER.highlight} strokeOpacity="0.13" strokeWidth="1" fill="none" />
          <circle cx="28" cy="132" r="2" fill={PAPER.fiber} fillOpacity="0.16" />
          <circle cx="144" cy="94" r="1.5" fill={PAPER.fiber} fillOpacity="0.14" />
          <circle cx="91" cy="39" r="1" fill={PAPER.burn} fillOpacity="0.18" />
          <circle cx="166" cy="166" r="2.5" fill={PAPER.burn} fillOpacity="0.09" />
        </pattern>
      </defs>

      <rect x="-30000" y="-24000" width="60000" height="48000" fill={PAPER.sea} />

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

      {/* A displaced underprint gives borders the soft black relief visible on
          photographed mid-century maps without a live blur filter. */}
      <g ref={coarseShadowRef} fill="none" stroke={PAPER.borderShadow} strokeLinejoin="round" strokeLinecap="round" opacity="0.48" aria-hidden="true">
        {landCoarse.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g ref={fineShadowRef} fill="none" stroke={PAPER.borderShadow} strokeLinejoin="round" strokeLinecap="round" opacity="0.48" aria-hidden="true">
        {landFine.map((d, i) => <path key={i} d={d} />)}
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

      <rect
        x="-30000"
        y="-24000"
        width="60000"
        height="48000"
        fill="url(#eu-paper-fiber)"
        opacity="0.48"
        pointerEvents="none"
      />

      <g
        ref={countryLabelRef}
        className="eu-country-labels"
        fill={PAPER.countryInk}
        stroke={PAPER.countryHalo}
        textAnchor="middle"
        aria-hidden="true"
      >
        {COUNTRY_LABELS.map((country) => (
          <text key={country.name} x={country.x} y={country.y}>
            {country.name}
          </text>
        ))}
      </g>

      {/* One layered red line for the active leg. These are three real paths,
          rather than a path plus <use>, so every layer receives the exact same
          partial geometry and its own explicit stroke width. */}
      <g ref={routeRef} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {legs.map((leg) => (
          <g
            key={leg.index}
            data-leg={leg.index}
            ref={(el) => (legRefs.current[leg.index] = el)}
            style={{ display: 'none' }}
          >
            {[
              ['underprint', PAPER.routeUnderprint],
              ['body', ROUTE.color],
              ['core', PAPER.routeHighlight],
            ].map(([layer, color], layerIndex) => (
              <g key={layer} data-route-layer={layer}>
                {leg.segments.map((seg, j) => {
                  const full = segmentPath(seg)
                  return (
                    <path
                      key={j}
                      ref={(el) => {
                        const segs = (headRefs.current.segs[leg.index] ??= [])
                        const layers = (segs[j] ??= [])
                        layers[layerIndex] = el
                      }}
                      d=""
                      data-full={full}
                      data-role="line"
                      data-route-layer={layer}
                      fill="none"
                      stroke={color}
                      style={{ display: 'none' }}
                    />
                  )
                })}
              </g>
            ))}
          </g>
        ))}
      </g>
    </svg>
  )
})
