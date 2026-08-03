import { useEffect, useRef, useState } from 'react'

/**
 * Drives the cutscene from document scroll.
 *
 * Calls onFrame(smoothed, target, moving) inside rAF. onFrame is expected to
 * mutate the DOM directly through refs and do ZERO setState -- at 60fps a
 * React render per frame would be hopeless.
 *
 * The smoothing is frame-rate independent: `1 - exp(-dt/TAU)` gives the same
 * curve at 60Hz, 120Hz, and through jank. The common `+= delta * 0.15` does
 * not -- it runs twice as fast on a 120Hz display.
 */

const TAU = 0.09 // seconds of lag; enough to feel filmic, not enough to feel broken
const SETTLE_EPSILON = 0.0004

export function useScrollDirector(trackRef, onFrame, enabled = true) {
  const cb = useRef(onFrame)
  // Synced after render rather than during it, so the rAF loop always calls
  // the latest closure without React complaining about render-phase writes.
  useEffect(() => {
    cb.current = onFrame
  })

  useEffect(() => {
    const track = trackRef.current
    if (!enabled || !track) return

    let raf = 0
    let running = false
    let visible = true
    let target = 0
    let smooth = 0
    let last = 0
    let wasMoving = null

    const readProgress = () => {
      const el = trackRef.current
      if (!el) return target
      const total = Math.max(1, el.offsetHeight - window.innerHeight)
      return Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total))
    }

    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now

      target = readProgress()
      smooth += (target - smooth) * (1 - Math.exp(-dt / TAU))

      const moving = Math.abs(target - smooth) > SETTLE_EPSILON
      cb.current(smooth, target, moving, moving !== wasMoving)
      wasMoving = moving

      if (moving && visible) {
        raf = requestAnimationFrame(tick)
      } else {
        // Land exactly on target so the final frame isn't a hair off.
        if (!moving && smooth !== target) {
          smooth = target
          cb.current(smooth, target, false, wasMoving !== false)
          wasMoving = false
        }
        running = false
      }
    }

    const schedule = () => {
      if (running || !visible) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    // Paint one frame immediately so the map isn't blank before first scroll.
    target = readProgress()
    smooth = target
    cb.current(smooth, target, false, true)

    // Don't burn battery animating a page that's scrolled away or unmounted.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
      },
      { rootMargin: '10% 0px' }
    )
    io.observe(track)

    window.addEventListener('scroll', schedule, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('scroll', schedule)
    }
  }, [enabled, trackRef])
}

/**
 * Container size, debounced, with the mobile address bar filtered out.
 *
 * iOS fires resize with a 60-120px height delta every time the URL bar
 * shows or hides mid-scroll. Reacting to that pops the viewBox visibly, so
 * height-only changes under the threshold are ignored.
 */
export function useStageSize(ref, onResize) {
  const cb = useRef(onResize)
  useEffect(() => {
    cb.current = onResize
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let lastW = 0
    let lastH = 0
    let timer = 0

    const apply = () => {
      const rect = el.getBoundingClientRect()
      lastW = rect.width
      lastH = rect.height
      cb.current({ width: rect.width, height: rect.height })
    }

    const maybe = () => {
      const rect = el.getBoundingClientRect()
      const widthChanged = Math.abs(rect.width - lastW) > 1
      const bigHeightChange = Math.abs(rect.height - lastH) > 120
      if (!widthChanged && !bigHeightChange) return
      clearTimeout(timer)
      timer = setTimeout(apply, 150)
    }

    apply()

    const ro = new ResizeObserver(maybe)
    ro.observe(el)
    window.addEventListener('orientationchange', maybe)

    return () => {
      clearTimeout(timer)
      ro.disconnect()
      window.removeEventListener('orientationchange', maybe)
    }
  }, [ref])
}

/** Live prefers-reduced-motion, so toggling it in devtools takes effect immediately. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return reduced
}
