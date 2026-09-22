import { useEffect, useState } from 'react'

import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion'

const GLYPHS = '/\\|_-=+*#%@<>[]{}!?:;~^'
const TICK_MS = 70
const CYCLE_MS = 2600
const BURST_MS = 350

function scramble(lines, p) {
  return lines.map((line) =>
    line.replace(/\S/g, (ch) =>
      Math.random() < p ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : ch
    )
  )
}

/**
 * ASCII art that keeps corrupting itself: a light constant flicker with a
 * heavy burst every few seconds, like a redacted file. `intense` holds it at
 * burst level (used on hover). Static under prefers-reduced-motion.
 */
export function GlitchArt({ lines, intense = false, className, style }) {
  const reducedMotion = usePrefersReducedMotion()
  const [shown, setShown] = useState(lines)

  useEffect(() => {
    if (reducedMotion) return
    const start = performance.now()
    const id = setInterval(() => {
      const burst = (performance.now() - start) % CYCLE_MS < BURST_MS
      setShown(scramble(lines, intense || burst ? 0.5 : 0.05))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [lines, intense, reducedMotion])

  return (
    <pre aria-hidden="true" className={className} style={style}>
      {(reducedMotion ? lines : shown).join('\n')}
    </pre>
  )
}
