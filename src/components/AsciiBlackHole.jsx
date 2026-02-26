import { useState, useEffect, useRef } from 'react'
import frames from '../blackhole-frames.json'

export function AsciiBlackHole({ onEnter }) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [glow, setGlow] = useState(0)
  const containerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
    const maxDist = 250
    const intensity = Math.max(0, 1 - dist / maxDist)
    setGlow(intensity)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden min-h-0 pt-4 relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGlow(0)}
      onClick={(e) => {
        const rect = containerRef.current.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2)
        if (dist <= 250 && onEnter) onEnter()
      }}
      style={{ cursor: glow > 0 ? 'pointer' : 'default' }}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none transition-opacity duration-200"
        style={{
          width: `${140 + glow * 60}px`,
          height: `${140 + glow * 60}px`,
          backgroundColor: `rgba(249, 115, 22, ${0.4 + glow * 0.4})`,
        }}
      />
      <pre className="text-neutral-800 text-[3.5px] sm:text-[4.5px] md:text-[6px] leading-[1] font-mono select-none w-fit relative">
        {frames[frameIndex].join('\n')}
      </pre>
    </div>
  )
}
