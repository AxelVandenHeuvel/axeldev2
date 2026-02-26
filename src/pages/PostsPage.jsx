import { useEffect, useRef, useMemo } from 'react'
import ColorBends from '../components/ColorBends'
import { projects } from '../data/projects'

function parseDate(d) {
  const [m, day, y] = d.split('/')
  return new Date(`20${y}`, parseInt(m) - 1, parseInt(day))
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return s / 2147483647
  }
}

function generateClipPath(idx) {
  const rand = seededRandom(idx * 137)
  const jitter = () => Math.round(rand() * 8)
  return `polygon(${jitter()}% ${jitter()}%, ${100 - jitter()}% ${jitter()}%, ${100 - jitter()}% ${100 - jitter()}%, ${jitter()}% ${100 - jitter()}%)`
}

function FloatingPost({ post, index, style, onClick }) {
  const ref = useRef(null)
  const clipPath = useMemo(() => generateClipPath(index), [index])

  useEffect(() => {
    const el = ref.current
    const duration = 4 + Math.random() * 3
    const xAmp = 8 + Math.random() * 12
    const yAmp = 6 + Math.random() * 10
    const delay = Math.random() * -10

    el.style.animation = `float-x ${duration}s ease-in-out ${delay}s infinite alternate, float-y ${duration * 1.3}s ease-in-out ${delay}s infinite alternate`
    el.style.setProperty('--float-x', `${xAmp}px`)
    el.style.setProperty('--float-y', `${yAmp}px`)
  }, [])

  return (
    <button
      ref={ref}
      onClick={() => onClick(post)}
      className="px-6 py-5 bg-white/5 backdrop-blur-sm border border-white/10 font-mono text-left hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer group"
      style={{ ...style, clipPath }}
    >
      <h3 className="text-white text-sm group-hover:text-white/90">{post.title}</h3>
      <span className="text-[10px] text-slate-500 mt-1 block">{post.tag} · {post.date}</span>
    </button>
  )
}

export function PostsPage({ onBack, onSelectPost }) {
  const sorted = useMemo(() =>
    [...projects].sort((a, b) => parseDate(b.date) - parseDate(a.date)),
    []
  )

  return (
    <div className="relative min-h-screen overflow-auto">
      <style>{`
        @keyframes float-x {
          from { translate: calc(var(--float-x) * -1) 0; }
          to { translate: var(--float-x) 0; }
        }
        @keyframes float-y {
          from { margin-top: calc(var(--float-y) * -1); }
          to { margin-top: var(--float-y); }
        }
      `}</style>

      <div className="fixed inset-0 bg-[#050914]" style={{ transform: 'translateZ(0)' }}>
        <ColorBends
          className="absolute inset-0"
          colors={["#FF0066", "#00FF88", "#0066FF"]}
          rotation={0}
          autoRotate={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0}
          parallax={0.5}
          noise={0.1}
          transparent={true}
          intensity={0.3}
        />
      </div>

      <div className="relative z-10 px-6 py-8">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white font-mono block transition-colors mb-4"
        >
          ← back
        </button>
        <h1 className="text-white text-2xl font-mono font-medium mb-8">posts</h1>

        <div className="flex flex-wrap gap-y-16 gap-x-24 max-w-5xl mx-auto justify-center">
          {sorted.map((post, i) => (
            <FloatingPost
              key={post.title}
              post={post}
              index={i}
              style={{
                width: '42%',
                marginLeft: `${((i * 17) % 7) - 3}%`,
              }}
              onClick={(p) => onSelectPost?.(p)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
