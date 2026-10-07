import { useCallback, useEffect, useRef, useState } from 'react'

import { ChapterHud } from '../components/europe/ChapterHud.jsx'
import { JourneyNav } from '../components/europe/JourneyNav.jsx'
import { JournalModal } from '../components/europe/JournalModal.jsx'
import { MapStage } from '../components/europe/MapStage.jsx'
import { PinLayer } from '../components/europe/PinLayer.jsx'
import { TravelFootageOverlay } from '../components/europe/TravelFootageOverlay.jsx'
import { GRAIN_URL, MOTTLE_URL, PAPER, PATINA, ROUTE, VIGNETTE } from '../components/europe/paper.js'
import {
  destinationFootageOpacity,
  footageOpacity,
  footagePlanForLeg,
  sequencedFootageMix,
} from '../data/europeMedia.js'
import { buildTimeline, parkedFrameForStop, sampleLegTravel } from '../lib/europeCamera.js'
import { destinations, legs, stops } from '../lib/europeRoute.js'
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion.js'

import '../components/europe/europe.css'

/** Above this viewBox width the fine European geometry isn't worth drawing. */
const LOD_SWAP = 6000
function durationForLeg(leg) {
  if (!leg) return 2800
  // Long crossings should feel like travel, while short regional hops still
  // get enough time for the route and camera move to read clearly.
  const base = Math.min(10000, Math.max(3200, 2800 + Math.sqrt(leg.length) * 38))
  const { transport, destination } = footagePlanForLeg(leg, stops[leg.index + 1])
  if (transport && destination) return Math.max(9000, base)
  if (destination) return Math.max(6800, base)
  if (transport) return Math.max(6200, base)
  return base
}

function graticuleWeights(w) {
  const blend = (low, high) => {
    const t = Math.min(1, Math.max(0, (w - low) / (high - low)))
    return t * t * (3 - 2 * t)
  }

  if (w >= 14400) return { 20: 1 }
  if (w > 9600) {
    const t = blend(9600, 14400)
    return { 10: 1 - t, 20: t }
  }
  if (w >= 4800) return { 10: 1 }
  if (w > 3200) {
    const t = blend(3200, 4800)
    return { 5: 1 - t, 10: t }
  }
  if (w >= 2160) return { 5: 1 }
  if (w > 1440) {
    const t = blend(1440, 2160)
    return { 2: 1 - t, 5: t }
  }
  return { 2: 1 }
}

function useStageSize(ref, onResize) {
  const callbackRef = useRef(onResize)

  useEffect(() => {
    callbackRef.current = onResize
  }, [onResize])

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    let lastWidth = 0
    let lastHeight = 0
    let timer = 0

    const apply = () => {
      const rect = element.getBoundingClientRect()
      lastWidth = rect.width
      lastHeight = rect.height
      callbackRef.current({ width: rect.width, height: rect.height })
    }

    const maybeApply = () => {
      const rect = element.getBoundingClientRect()
      const widthChanged = Math.abs(rect.width - lastWidth) > 1
      const heightChanged = Math.abs(rect.height - lastHeight) > 120
      if (!widthChanged && !heightChanged) return
      window.clearTimeout(timer)
      timer = window.setTimeout(apply, 150)
    }

    apply()
    const observer = new ResizeObserver(maybeApply)
    observer.observe(element)
    window.addEventListener('orientationchange', maybeApply)

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('orientationchange', maybeApply)
    }
  }, [ref])
}

/**
 * Europe 2026 is a sequence of parked map chapters connected by explicit
 * command-driven animations.
 *
 * The camera timeline is still used as the source of truth for each chapter's
 * framing, but it is sampled only while a command-driven leg is playing. There
 * is no scroll track, scroll listener, or scroll scrubbing in this page.
 */
export default function Europe2026Page({ backTo }) {
  const reducedMotion = usePrefersReducedMotion()
  // stops includes Seattle at index 0; destinations intentionally does not.
  // Keeping this in stop coordinates prevents the old off-by-one state that
  // opened on Reykjavík with leg 0 already complete.
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [journalIndex, setJournalIndex] = useState(null)
  const [stageVersion, setStageVersion] = useState(0)

  const stageRef = useRef(null)
  const svgRef = useRef(null)
  const fineRef = useRef(null)
  const coarseRef = useRef(null)
  const fineShadowRef = useRef(null)
  const coarseShadowRef = useRef(null)
  const graticuleRef = useRef(null)
  const countryLabelRef = useRef(null)
  const routeRef = useRef(null)
  const legRefs = useRef([])
  const headRefs = useRef({ segs: [] })
  const footageRef = useRef(null)
  const pinRefs = useRef([])
  const overlayRef = useRef(null)

  const sizeRef = useRef({ width: 1, height: 1 })
  const aspectRef = useRef(1.6)
  const timelineRef = useRef(null)
  const animationRef = useRef(null)
  const renderChapterRef = useRef(null)
  const autoStartRef = useRef(false)
  const lastStyleKRef = useRef(-1)

  const currentStop = stops[currentStopIndex]
  const selectedIndex = currentStop?.destIndex ?? -1

  useEffect(() => {
    if (document.getElementById('eu26-fonts')) return
    const link = document.createElement('link')
    link.id = 'eu26-fonts'
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600' +
      '&family=Barlow+Condensed:wght@500;600&family=IM+Fell+English+SC&family=Special+Elite&display=swap'
    document.head.appendChild(link)
  }, [])

  useStageSize(
    stageRef,
    useCallback(({ width, height }) => {
      if (!width || !height) return
      sizeRef.current = { width, height }
      aspectRef.current = width / height
      timelineRef.current = buildTimeline(aspectRef.current)
      lastStyleKRef.current = -1
      setStageVersion((version) => version + 1)
    }, [])
  )

  const cancelAnimation = useCallback(() => {
    const animation = animationRef.current
    if (animation) window.cancelAnimationFrame(animation.frame)
    animationRef.current = null
    setIsAnimating(false)
  }, [])

  const selectChapter = useCallback(
    (index) => {
      const next = Math.max(0, Math.min(destinations.length - 1, index))
      cancelAnimation()
      const stopIndex = destinations[next].index
      const timeline = timelineRef.current
      const parked = parkedFrameForStop(timeline, stopIndex)
      if (parked) renderChapterRef.current?.(parked)
      setCurrentStopIndex(stopIndex)
    },
    [cancelAnimation]
  )

  const startLeg = useCallback(
    (legIndex) => {
      if (animationRef.current || legIndex < 0 || legIndex >= legs.length) return

      const timeline = timelineRef.current
      const origin = parkedFrameForStop(timeline, legIndex)
      if (!timeline || !origin) return

      if (reducedMotion) {
        const arrival = parkedFrameForStop(timeline, legIndex + 1)
        if (arrival) renderChapterRef.current?.(arrival)
        setCurrentStopIndex(legIndex + 1)
        return
      }

      const animation = {
        fromStop: legIndex,
        toStop: legIndex + 1,
        startedAt: performance.now(),
        duration: durationForLeg(legs[legIndex]),
        frame: 0,
      }
      animationRef.current = animation
      setIsAnimating(true)
      renderChapterRef.current?.(sampleLegTravel(timeline, legIndex, 0, origin))

      const tick = (now) => {
        if (animationRef.current !== animation) return

        const local = Math.min(1, (now - animation.startedAt) / animation.duration)
        const liveTimeline = timelineRef.current
        const liveOrigin = parkedFrameForStop(liveTimeline, animation.fromStop)
        const shot = sampleLegTravel(liveTimeline, animation.fromStop, local, liveOrigin)
        if (shot) renderChapterRef.current?.(shot)

        if (local >= 1) {
          animationRef.current = null
          setIsAnimating(false)
          setCurrentStopIndex(animation.toStop)
          return
        }
        animation.frame = window.requestAnimationFrame(tick)
      }

      animation.frame = window.requestAnimationFrame(tick)
    },
    [reducedMotion]
  )

  const stepChapter = useCallback(
    (delta) => {
      if (delta < 0) {
        // Left is a navigation command, not a reverse cutscene. If it is
        // pressed mid-leg, return immediately to that leg's departure. Once
        // parked, each subsequent press jumps back one completed stop.
        if (animationRef.current) {
          const stopIndex = animationRef.current.fromStop
          cancelAnimation()
          const parked = parkedFrameForStop(timelineRef.current, stopIndex)
          if (parked) renderChapterRef.current?.(parked)
          setCurrentStopIndex(stopIndex)
          return
        }
        if (currentStopIndex <= 0) return
        cancelAnimation()
        const stopIndex = currentStopIndex - 1
        const parked = parkedFrameForStop(timelineRef.current, stopIndex)
        if (parked) renderChapterRef.current?.(parked)
        setCurrentStopIndex(stopIndex)
        return
      }

      if (animationRef.current || isAnimating) return
      if (currentStopIndex >= stops.length - 1) return
      startLeg(currentStopIndex)
    },
    [cancelAnimation, currentStopIndex, isAnimating, startLeg]
  )

  const onChapterKeyDown = useCallback((event) => {
    if (event.defaultPrevented || journalIndex !== null) return
    const tag = event.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return

    if (event.key === 'ArrowLeft') stepChapter(-1)
    else if (event.key === 'ArrowRight') stepChapter(1)
    else if (event.key === 'Home') selectChapter(0)
    else if (event.key === 'End') selectChapter(destinations.length - 1)
    else return
    event.preventDefault()
  }, [journalIndex, selectChapter, stepChapter])

  // Listen on the window rather than relying on focus being inside the map.
  // The stage itself is not focusable, so page-level arrow navigation must
  // also work immediately after arrival without an extra click.
  useEffect(() => {
    window.addEventListener('keydown', onChapterKeyDown)
    return () => window.removeEventListener('keydown', onChapterKeyDown)
  }, [onChapterKeyDown])

  const renderChapter = useCallback(
    (shot) => {
      const svg = svgRef.current
      if (!svg || !shot) return

      const { w, stopIndex, legIndex, legT, phase, active } = shot
      const h = w / aspectRef.current
      const routeLegIndex = legIndex
      const routeActive = routeLegIndex >= 0 ? active : null
      const { cx, cy } = shot
      const vx = cx - w / 2
      const vy = cy - h / 2
      svg.setAttribute('viewBox', `${vx} ${vy} ${w} ${h}`)

      const k = w / sizeRef.current.width
      if (fineRef.current) fineRef.current.setAttribute('stroke-width', 1.35 * k)
      if (coarseRef.current) coarseRef.current.setAttribute('stroke-width', 1.45 * k)
      if (fineShadowRef.current) {
        fineShadowRef.current.setAttribute('stroke-width', 5.4 * k)
        fineShadowRef.current.setAttribute('transform', `translate(${1.8 * k} ${2.6 * k})`)
      }
      if (coarseShadowRef.current) {
        coarseShadowRef.current.setAttribute('stroke-width', 5.8 * k)
        coarseShadowRef.current.setAttribute('transform', `translate(${1.8 * k} ${2.6 * k})`)
      }
      if (graticuleRef.current) graticuleRef.current.setAttribute('stroke-width', 0.5 * k)
      if (countryLabelRef.current) {
        countryLabelRef.current.setAttribute('font-size', 11 * k)
        countryLabelRef.current.setAttribute('stroke-width', 2.4 * k)
      }

      // Crossfade the simplified world geometry into the detailed European
      // geometry across a broad zoom band. Both coastlines and their displaced
      // underprints share the same eased mix, so no border can pop in alone.
      const lodRaw = Math.min(1, Math.max(0, (w - LOD_SWAP * 0.65) / (LOD_SWAP * 0.7)))
      const coarseMix = lodRaw * lodRaw * (3 - 2 * lodRaw)
      const fineMix = 1 - coarseMix
      if (coarseRef.current) {
        coarseRef.current.style.display = coarseMix <= 0 ? 'none' : ''
        coarseRef.current.style.opacity = String(coarseMix)
      }
      if (fineRef.current) {
        fineRef.current.style.display = fineMix <= 0 ? 'none' : ''
        fineRef.current.style.opacity = String(fineMix)
      }
      if (coarseShadowRef.current) {
        coarseShadowRef.current.style.display = coarseMix <= 0 ? 'none' : ''
        coarseShadowRef.current.style.opacity = String(0.48 * coarseMix)
      }
      if (fineShadowRef.current) {
        fineShadowRef.current.style.display = fineMix <= 0 ? 'none' : ''
        fineShadowRef.current.style.opacity = String(0.48 * fineMix)
      }

      const gridWeights = graticuleWeights(w)
      const gridGroups = graticuleRef.current?.children ?? []
      for (const group of gridGroups) {
        const opacity = gridWeights[group.dataset.tier] ?? 0
        group.style.display = opacity <= 0 ? 'none' : ''
        group.style.opacity = String(opacity)
      }

      if (Math.abs(k - lastStyleKRef.current) > 1e-6) {
        lastStyleKRef.current = k
        const widths = {
          underprint: ROUTE.underprintWidth,
          body: ROUTE.width,
          core: ROUTE.coreWidth,
        }
        routeRef.current?.querySelectorAll('path[data-route-layer]').forEach((element) => {
          element.setAttribute('stroke-width', widths[element.dataset.routeLayer] * k)
        })
      }

      for (let i = 0; i < legs.length; i++) {
        const group = legRefs.current[i]
        if (!group) continue
        const active = i === routeLegIndex
        group.style.display = active ? '' : 'none'
        if (!active) continue

        const segments = headRefs.current.segs[i] ?? []
        for (let j = 0; j < segments.length; j++) {
          const path = routeActive?.parts[j]
          for (const layer of segments[j] ?? []) {
            layer.style.display = path ? '' : 'none'
            if (path) layer.setAttribute('d', path)
          }
        }
      }

      // Only visually long plane/train segments receive a footage plate.
      // Selection is deterministic, giving adjacent eligible chapters variety
      // without loading or changing sources at interaction time.
      const footage = footageRef.current
      const { transport: transportSelection, destination: destinationSelection } = footagePlanForLeg(
        legs[routeLegIndex],
        stops[routeLegIndex + 1]
      )
      if (footage) {
        const visible = phase === 'draw' && !reducedMotion
        const hasSequence = Boolean(transportSelection && destinationSelection)
        const mix = hasSequence ? sequencedFootageMix(legT) : null
        const opacity = !visible
          ? 0
          : mix
            ? mix.containerOpacity
            : destinationSelection
              ? destinationFootageOpacity(legT)
              : transportSelection
                ? footageOpacity(legT, transportSelection.treatment)
                : 0
        const weights = new Map()
        if (visible && transportSelection) {
          weights.set(transportSelection.clipId, mix?.transportWeight ?? 1)
        }
        if (visible && destinationSelection) {
          weights.set(destinationSelection.clipId, mix?.destinationWeight ?? 1)
        }
        footage.dataset.mode = hasSequence
          ? 'crossfade'
          : destinationSelection?.mode ?? transportSelection?.mode ?? 'none'
        footage.dataset.treatment = hasSequence
          ? 'sequence'
          : destinationSelection?.treatment ?? transportSelection?.treatment ?? 'none'

        const activeVideos = []
        for (const video of footage.querySelectorAll('video[data-travel-clip]')) {
          const weight = weights.get(video.dataset.travelClip) ?? 0
          if (weight <= 0) {
            video.style.opacity = '0'
            video.pause()
            video.dataset.playbackActive = 'false'
            continue
          }
          if (video.dataset.playbackActive !== 'true') video.currentTime = 0
          video.dataset.playbackActive = 'true'
          video.play().catch(() => {})
          activeVideos.push({ video, weight, ready: video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA })
        }

        // Normalize the weights among ready plates. If the destination frame
        // is late, the transport plate holds rather than exposing the map and
        // causing a brightness dip in the middle of the crossfade.
        const readyWeight = activeVideos.reduce((sum, item) => sum + (item.ready ? item.weight : 0), 0)
        for (const item of activeVideos) {
          item.video.style.opacity = item.ready && readyWeight > 0 ? String(item.weight / readyWeight) : '0'
        }
        footage.style.opacity = String(readyWeight > 0 ? opacity : 0)
        footage.dataset.activeClip = [...weights.entries()]
          .filter(([, weight]) => weight > 0)
          .map(([clipId]) => clipId)
          .join(',') || 'none'
      }

      const { width: cw, height: ch } = sizeRef.current
      const toScreenX = (x) => ((x - vx) / w) * cw
      const toScreenY = (y) => ((y - vy) / h) * ch
      for (let i = 0; i < stops.length; i++) {
        const element = pinRefs.current[i]
        if (!element) continue
        const relevant = i === stopIndex
        if (!relevant) {
          element.style.visibility = 'hidden'
          continue
        }
        const sx = toScreenX(stops[i].x)
        const sy = toScreenY(stops[i].y)
        const off = sx < -120 || sy < -60 || sx > cw + 120 || sy > ch + 60
        element.style.visibility = off ? 'hidden' : 'visible'
        if (!off) element.style.transform = `translate3d(${sx}px, ${sy}px, 0)`
      }

      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = 'auto'
        overlayRef.current.dataset.settled = 'true'
      }

    },
    [reducedMotion]
  )

  useEffect(() => {
    renderChapterRef.current = renderChapter
  }, [renderChapter])

  useEffect(() => {
    const timeline = timelineRef.current
    if (!timeline || !currentStop) return
    if (animationRef.current) {
      const animation = animationRef.current
      const elapsed = performance.now() - animation.startedAt
      const local = Math.min(1, elapsed / animation.duration)
      const origin = parkedFrameForStop(timeline, animation.fromStop)
      renderChapter(sampleLegTravel(timeline, animation.fromStop, local, origin))
      return
    }
    renderChapter(parkedFrameForStop(timeline, currentStop.index))

  }, [currentStop, renderChapter, stageVersion])

  // The opening Seattle -> Reykjavík chapter begins as soon as the stage has
  // a measured camera. Later chapters always wait for explicit user input.
  useEffect(() => {
    if (stageVersion === 0 || currentStopIndex !== 0 || autoStartRef.current) return undefined
    const frame = window.requestAnimationFrame(() => {
      if (autoStartRef.current) return
      autoStartRef.current = true
      startLeg(0)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [currentStopIndex, stageVersion, startLeg])

  useEffect(() => () => cancelAnimation(), [cancelAnimation])

  const onPinSelect = useCallback((stopIndex) => {
    if (animationRef.current) return
    const destinationIndex = stops[stopIndex]?.destIndex
    if (destinationIndex === undefined) return
    setCurrentStopIndex(stopIndex)
    setJournalIndex(stopIndex)
  }, [])

  const stepJournal = useCallback((delta) => {
    setJournalIndex((current) => {
      if (current === null) return current
      const destinationIndex = stops[current]?.destIndex
      if (destinationIndex === undefined) return current
      const next = Math.min(destinations.length - 1, Math.max(0, destinationIndex + delta))
      const nextStop = destinations[next]
      setCurrentStopIndex(nextStop.index)
      return nextStop.index
    })
  }, [])

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ backgroundColor: PAPER.base }}
    >
      <div
        ref={stageRef}
        className="relative h-full w-full eu-stage"
      >
        <div className="absolute inset-0" style={{ backgroundColor: PAPER.sea }} />

        <MapStage
          ref={svgRef}
          fineRef={fineRef}
          coarseRef={coarseRef}
          fineShadowRef={fineShadowRef}
          coarseShadowRef={coarseShadowRef}
          graticuleRef={graticuleRef}
          countryLabelRef={countryLabelRef}
          routeRef={routeRef}
          headRefs={headRefs}
          legRefs={legRefs}
        />

        <TravelFootageOverlay ref={footageRef} />

        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: MOTTLE_URL, opacity: 0.72, mixBlendMode: 'multiply' }}
        />
        <div
          className="eu-paper-patina pointer-events-none absolute inset-0"
          style={{ backgroundImage: PATINA }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: GRAIN_URL, opacity: 0.46, mixBlendMode: 'multiply' }}
        />
        <div className="pointer-events-none absolute inset-0" style={{ background: VIGNETTE }} />

        <PinLayer ref={overlayRef} pinRefs={pinRefs} onSelect={onPinSelect} />

        <ChapterHud backTo={backTo} />

        <JourneyNav
          selectedIndex={selectedIndex}
          canPrevious={currentStopIndex > 0}
          canNext={currentStopIndex < stops.length - 1}
          isAnimating={isAnimating}
          onSelect={selectChapter}
          onPrevious={() => stepChapter(-1)}
          onNext={() => stepChapter(1)}
        />
      </div>

      <JournalModal
        stopIndex={journalIndex}
        onClose={() => setJournalIndex(null)}
        onStep={stepJournal}
      />
    </div>
  )
}
