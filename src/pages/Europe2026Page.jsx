import { useCallback, useEffect, useRef, useState } from 'react'

import { ChapterHud } from '../components/europe/ChapterHud.jsx'
import { JournalModal } from '../components/europe/JournalModal.jsx'
import { MapStage } from '../components/europe/MapStage.jsx'
import { PinLayer } from '../components/europe/PinLayer.jsx'
import { setMarkerGlyph } from '../components/europe/glyphs.js'
import { StaticRouteMap } from '../components/europe/StaticRouteMap.jsx'
import {
  usePrefersReducedMotion,
  useScrollDirector,
  useStageSize,
} from '../components/europe/useScrollDirector.js'
import { GRAIN_URL, MOTTLE_URL, PAPER, ROUTE_STYLE, VIGNETTE } from '../components/europe/paper.js'
import { buildTimeline, progressForStop, sampleTimeline } from '../lib/europeCamera.js'
import { legs, stops, truncateLeg } from '../lib/europeRoute.js'
import { meta } from '../data/europe2026.js'

import '../components/europe/europe.css'

/**
 * Europe 2026 -- the scroll cutscene.
 *
 * Default export because App.jsx lazy()-loads this; the rest of the codebase
 * uses named exports.
 *
 * The hot path never touches React state. useScrollDirector calls onFrame
 * inside rAF and onFrame mutates the DOM through refs. React re-renders only
 * on chapter boundaries (~29 times over the whole page) and when the journal
 * opens.
 */

/** Scroll length. Long enough to pace 29 shots, short enough not to exhaust. */
const TRACK_VH_DESKTOP = 1150
const TRACK_VH_MOBILE = 700

/** Above this viewBox width the fine European geometry isn't worth drawing. */
const LOD_SWAP = 6000
const RHUMB_FADE = [4000, 11000]

function graticuleTier(w) {
  if (w > 12000) return '20'
  if (w > 4000) return '10'
  if (w > 1800) return '5'
  return '2'
}

export default function Europe2026Page({ onBack }) {
  const reducedMotion = usePrefersReducedMotion()
  const [forceStatic, setForceStatic] = useState(false)
  const [journalIndex, setJournalIndex] = useState(null)
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  const isStatic = reducedMotion || forceStatic

  const trackRef = useRef(null)
  const stageRef = useRef(null)
  const svgRef = useRef(null)
  const fineRef = useRef(null)
  const coarseRef = useRef(null)
  const graticuleRef = useRef(null)
  const rhumbRef = useRef(null)
  const routeRef = useRef(null)
  const legRefs = useRef([])
  const headRefs = useRef({ segs: [], rails: [] })
  const overlayRef = useRef(null)
  const pinRefs = useRef([])
  const markerRef = useRef(null)
  const markerGlyphRef = useRef(null)
  const chapterRef = useRef(null)
  const counterRef = useRef(null)
  const railRef = useRef(null)
  const titleRef = useRef(null)

  // Mutable frame state -- deliberately outside React.
  const sizeRef = useRef({ width: 1, height: 1 })
  const aspectRef = useRef(1.6)
  const timelineRef = useRef(null)
  const lastChapterRef = useRef(-1)
  const lastTierRef = useRef(null)
  const lastLodRef = useRef(null)
  const lastLegStateRef = useRef([])
  const settledRef = useRef(null)

  // Fonts: injected here rather than @import'd globally, so the rest of the
  // site doesn't pay a render-blocking round-trip for three display faces.
  useEffect(() => {
    if (document.getElementById('eu26-fonts')) return
    const link = document.createElement('link')
    link.id = 'eu26-fonts'
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600' +
      '&family=IM+Fell+English+SC&family=Special+Elite&display=swap'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // The timeline is built from the measured stage, not during render --
  // useStageSize fires once on mount before the scroll loop starts, and
  // onFrame no-ops until it exists.
  useStageSize(
    stageRef,
    useCallback(({ width, height }) => {
      if (!width || !height) return
      sizeRef.current = { width, height }
      aspectRef.current = width / height
      // Shot framing depends on aspect, so the timeline is rebuilt on resize
      // rather than stored as viewBox strings (which don't survive reshape).
      timelineRef.current = buildTimeline(aspectRef.current)
      lastChapterRef.current = -1
    }, [])
  )

  const onFrame = useCallback(
    (p, target, moving, movingChanged) => {
      const svg = svgRef.current
      const shots = timelineRef.current
      if (!svg || !shots) return

      const aspect = aspectRef.current
      const { cx, cy, w, legIndex, legT } = sampleTimeline(shots, p)
      const h = w / aspect

      const vx = cx - w / 2
      const vy = cy - h / 2
      svg.setAttribute('viewBox', `${vx} ${vy} ${w} ${h}`)

      // User units per screen pixel. Everything stroke-related scales by this,
      // instead of vector-effect="non-scaling-stroke", which interacts
      // ambiguously with stroke-dasharray across engines.
      const k = w / sizeRef.current.width

      if (fineRef.current) fineRef.current.setAttribute('stroke-width', 0.6 * k)
      if (coarseRef.current) coarseRef.current.setAttribute('stroke-width', 0.7 * k)
      if (graticuleRef.current) graticuleRef.current.setAttribute('stroke-width', 0.5 * k)
      if (rhumbRef.current) rhumbRef.current.setAttribute('stroke-width', 0.45 * k)

      // --- level of detail -------------------------------------------------
      const lod = w > LOD_SWAP ? 'coarse' : 'fine'
      if (lod !== lastLodRef.current) {
        lastLodRef.current = lod
        if (coarseRef.current) coarseRef.current.style.opacity = lod === 'coarse' ? '1' : '0'
        if (fineRef.current) fineRef.current.style.display = lod === 'coarse' && mobile ? 'none' : ''
      }
      if (coarseRef.current) {
        // Crossfade rather than snap, so the dive doesn't blink.
        const t = Math.min(1, Math.max(0, (w - LOD_SWAP * 0.7) / (LOD_SWAP * 0.6)))
        coarseRef.current.style.opacity = String(t)
      }

      if (rhumbRef.current) {
        const [lo, hi] = RHUMB_FADE
        const t = Math.min(1, Math.max(0, (w - lo) / (hi - lo)))
        rhumbRef.current.style.opacity = String(t * 0.9)
      }

      const tier = graticuleTier(w)
      if (tier !== lastTierRef.current) {
        lastTierRef.current = tier
        const groups = graticuleRef.current?.children ?? []
        for (const g of groups) g.style.display = g.dataset.tier === tier ? '' : 'none'
      }

      // --- route -----------------------------------------------------------
      const legState = lastLegStateRef.current
      for (let i = 0; i < legs.length; i++) {
        const group = legRefs.current[i]
        if (!group) continue

        const state = i < legIndex ? 'done' : i === legIndex ? 'active' : 'future'
        const style = ROUTE_STYLE[legs[i].mode] ?? ROUTE_STYLE.train

        if (state !== legState[i]) {
          group.style.display = state === 'future' ? 'none' : ''
          if (state === 'done') {
            // Restore the complete geometry once and stop touching this leg.
            for (const el of headRefs.current.segs[i] ?? []) {
              if (el) el.setAttribute('d', el.dataset.full)
            }
            for (const el of headRefs.current.rails[i] ?? []) {
              if (el) el.setAttribute('d', el.dataset.full)
            }
          }
          legState[i] = state
        }

        if (state === 'active') {
          const { parts } = truncateLeg(legs[i], legT)
          const segs = headRefs.current.segs[i] ?? []
          const rails = headRefs.current.rails[i] ?? []
          for (let j = 0; j < segs.length; j++) {
            const d = parts[j]
            if (segs[j]) {
              segs[j].style.display = d ? '' : 'none'
              if (d) segs[j].setAttribute('d', d)
            }
            if (rails[j]) {
              rails[j].style.display = d ? '' : 'none'
              if (d) rails[j].setAttribute('d', d)
            }
          }
        }

        // Dash pattern is set per-leg because each mode has its own rhythm.
        if (state !== 'future') {
          for (const el of headRefs.current.segs[i] ?? []) {
            if (!el) continue
            const mode = el.dataset.mode
            const s = ROUTE_STYLE[mode] ?? style
            el.setAttribute('stroke-width', (mode === 'train' ? 5.5 : s.width) * k)
            el.setAttribute(
              'stroke-dasharray',
              mode === 'train'
                ? `${1.5 * k} ${9 * k}`
                : s.dash.map((n) => n * k).join(' ')
            )
            if (mode === 'train') el.setAttribute('stroke-linecap', 'butt')
          }
          for (const el of headRefs.current.rails[i] ?? []) {
            if (el) el.setAttribute('stroke-width', 1.4 * k)
          }
        }
      }

      // --- overlay ---------------------------------------------------------
      const { width: cw, height: ch } = sizeRef.current
      const toScreenX = (x) => ((x - vx) / w) * cw
      const toScreenY = (y) => ((y - vy) / h) * ch

      for (let i = 0; i < stops.length; i++) {
        const el = pinRefs.current[i]
        if (!el) continue
        // A stop appears once its arrival leg has been drawn.
        const arrived = i === 0 || i - 1 < legIndex || (i - 1 === legIndex && legT > 0.985)
        if (!arrived) {
          el.style.visibility = 'hidden'
          continue
        }
        const sx = toScreenX(stops[i].x)
        const sy = toScreenY(stops[i].y)
        const off = sx < -120 || sy < -60 || sx > cw + 120 || sy > ch + 60
        el.style.visibility = off ? 'hidden' : 'visible'
        if (!off) el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`
      }

      const marker = markerRef.current
      if (marker) {
        const active = legs[legIndex]
        if (active && legT > 0 && legT < 1) {
          const { head } = truncateLeg(active, legT)
          if (head) {
            const sx = toScreenX(head.x)
            const sy = toScreenY(head.y)
            // Uniform world->screen scale means the world angle IS the screen
            // angle -- no conversion needed.
            const flip = head.mode === 'plane' ? 1 : head.angle > 90 || head.angle < -90 ? -1 : 1
            marker.style.visibility = 'visible'
            marker.style.transform = `translate3d(${sx}px, ${sy}px, 0) rotate(${head.angle}deg) scaleY(${flip})`
            setMarkerGlyph(markerGlyphRef.current, head.mode)
          }
        } else {
          marker.style.visibility = 'hidden'
        }
      }

      // Title card clears out over the opening beat.
      const title = titleRef.current
      if (title) {
        const fade = Math.min(1, Math.max(0, (p - 0.005) / 0.05))
        title.style.opacity = String(1 - fade)
        title.style.transform = `translate3d(0, ${-28 * fade}px, 0)`
        title.style.visibility = fade >= 1 ? 'hidden' : 'visible'
      }

      // --- interaction gate -------------------------------------------------
      if (movingChanged && overlayRef.current && settledRef.current !== !moving) {
        settledRef.current = !moving
        overlayRef.current.style.pointerEvents = moving ? 'none' : 'auto'
        overlayRef.current.dataset.settled = String(!moving)
      }

      // --- chapter (the only React-adjacent work, ~29 times total) ----------
      const current = legT > 0.55 ? legIndex + 1 : Math.max(0, legIndex)
      if (current !== lastChapterRef.current) {
        lastChapterRef.current = current
        const stop = stops[Math.min(current, stops.length - 1)]
        if (chapterRef.current) chapterRef.current.textContent = stop.name
        if (counterRef.current) {
          counterRef.current.textContent = `${String(current + 1).padStart(2, '0')} / ${stops.length} · ${stop.country}`
        }
        const ticks = railRef.current?.querySelectorAll('[data-rail-bar]') ?? []
        ticks.forEach((bar, i) => {
          const on = i <= current
          bar.style.width = on ? '26px' : '14px'
          bar.style.backgroundColor = on ? PAPER.pin : `${PAPER.landEdge}66`
        })
      }
    },
    [mobile]
  )

  useScrollDirector(trackRef, onFrame, !isStatic)

  const jumpToStop = useCallback((i) => {
    const track = trackRef.current
    const shots = timelineRef.current
    if (!track || !shots) return
    const p = progressForStop(shots, i)
    const total = Math.max(1, track.offsetHeight - window.innerHeight)
    window.scrollTo({ top: track.offsetTop + p * total, behavior: 'smooth' })
  }, [])

  const stepJournal = useCallback((delta) => {
    setJournalIndex((cur) => {
      if (cur === null) return cur
      return Math.min(stops.length - 1, Math.max(0, cur + delta))
    })
  }, [])

  const hud = (
    <ChapterHud
      onBack={onBack}
      onJump={jumpToStop}
      onOpen={setJournalIndex}
      onToggleStatic={() => setForceStatic((v) => !v)}
      isStatic={isStatic}
      chapterRef={chapterRef}
      counterRef={counterRef}
      railRef={railRef}
    />
  )

  if (isStatic) {
    return (
      <div className="relative" style={{ backgroundColor: PAPER.base }}>
        <StaticRouteMap onSelect={setJournalIndex} />
        <div className="pointer-events-none fixed inset-0 z-30">{hud}</div>
        <JournalModal
          stopIndex={journalIndex}
          onClose={() => setJournalIndex(null)}
          onStep={stepJournal}
        />
      </div>
    )
  }

  return (
    <div className="relative" style={{ backgroundColor: PAPER.base }}>
      <div
        ref={trackRef}
        className="relative"
        style={{ height: `${mobile ? TRACK_VH_MOBILE : TRACK_VH_DESKTOP}vh` }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden eu-stage">
          <div ref={stageRef} className="relative h-full w-full">
            <div className="absolute inset-0" style={{ backgroundColor: PAPER.sea }} />

            <MapStage
              ref={svgRef}
              fineRef={fineRef}
              coarseRef={coarseRef}
              graticuleRef={graticuleRef}
              rhumbRef={rhumbRef}
              routeRef={routeRef}
              headRefs={headRefs}
              legRefs={legRefs}
              mobile={mobile}
            />

            {/* Static texture layers. Above the map so the map takes the grain,
                but never repainted -- the turbulence is baked into a tile. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: MOTTLE_URL, opacity: mobile ? 0.35 : 0.5 }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: GRAIN_URL,
                opacity: mobile ? 0.16 : 0.26,
                // Blend modes force an extra compositing pass; skip on mobile.
                mixBlendMode: mobile ? 'normal' : 'multiply',
              }}
            />
            <div className="pointer-events-none absolute inset-0" style={{ background: VIGNETTE }} />

            <PinLayer
              ref={overlayRef}
              pinRefs={pinRefs}
              markerRef={markerRef}
              markerGlyphRef={markerGlyphRef}
              onSelect={setJournalIndex}
            />

            {hud}

            {/* Title card, fades out as the journey begins. */}
            <div
              ref={titleRef}
              className="pointer-events-none absolute inset-x-0 top-[22%] flex flex-col items-center px-6 text-center eu-titlecard"
            >
              <h1
                className="text-4xl leading-none tracking-[0.06em] sm:text-6xl"
                style={{ color: PAPER.inkDeep, fontFamily: 'Cinzel, serif' }}
              >
                {meta.title}
              </h1>
              <p
                className="mt-3 text-[11px] uppercase tracking-[0.34em] sm:text-xs"
                style={{ color: PAPER.inkBody, fontFamily: '"IM Fell English SC", serif' }}
              >
                {meta.subtitle}
              </p>
              <p
                className="mt-8 font-mono text-[10px] tracking-widest opacity-70"
                style={{ color: PAPER.inkBody }}
              >
                scroll to begin
              </p>
            </div>
          </div>
        </div>
      </div>

      <JournalModal
        stopIndex={journalIndex}
        onClose={() => setJournalIndex(null)}
        onStep={stepJournal}
      />
    </div>
  )
}
