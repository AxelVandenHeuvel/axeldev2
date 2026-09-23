import { useEffect, useRef, useState } from 'react'

import frames from '../blackhole-frames.json'

const FRAME_MS = 100
/** Cursor distance (px) from the center within which the hole reacts. */
const REACH = 250

export function AsciiBlackHole({ onEnter }) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [glow, setGlow] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length)
    }, FRAME_MS)
    return () => clearInterval(interval)
  }, [])

  const distanceFromCenter = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    return Math.hypot(e.clientX - (rect.left + rect.width / 2), e.clientY - (rect.top + rect.height / 2))
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden min-h-0 pt-4 relative outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--home-ink)] rounded-sm"
      onMouseMove={(e) => setGlow(Math.max(0, 1 - distanceFromCenter(e) / REACH))}
      onMouseLeave={() => setGlow(0)}
      onClick={(e) => distanceFromCenter(e) <= REACH && onEnter()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEnter()
        }
      }}
      role="link"
      tabIndex={0}
      aria-label="enter posts"
      style={{ cursor: glow > 0 ? 'pointer' : 'default' }}
    >
      {/* Opacity tracks the cursor instantly; only the theme color fades. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none bg-[color:var(--home-glow)] transition-[background-color] duration-500"
        style={{
          width: `${140 + glow * 60}px`,
          height: `${140 + glow * 60}px`,
          opacity: 0.4 + glow * 0.4,
        }}
      />
      <pre className="text-[color:var(--home-hole)] transition-colors duration-500 text-[3.5px] sm:text-[4.5px] md:text-[6px] leading-[1] font-mono select-none w-fit relative">
        {frames[frameIndex].join('\n')}
      </pre>
    </div>
  )
}
