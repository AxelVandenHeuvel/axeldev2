import { useMemo } from 'react'

import { projects } from '../data/projects'

function parseDate(d) {
  const [m, day, y] = d.split('/')
  return new Date(`20${y}`, parseInt(m) - 1, parseInt(day))
}

export function PostsPage({ onBack, onSelectPost, title = 'posts', posts = projects }) {
  const sorted = useMemo(() =>
    [...posts].sort((a, b) => parseDate(b.date) - parseDate(a.date)),
    [posts]
  )

  return (
    <div className="relative min-h-screen overflow-auto bg-[#050914]">
      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white font-mono block transition-colors mb-4"
        >
          ← back
        </button>
        <h1 className="text-white text-2xl font-mono font-medium mb-8">{title}</h1>

        <div>
          {sorted.length === 0 && (
            <p className="text-sm text-slate-500 font-mono">nothing here yet.</p>
          )}
          {sorted.map((post, i) => (
            <div key={post.title}>
              <button
                onClick={() => onSelectPost?.(post)}
                className="w-full flex items-center justify-between py-4 font-mono text-white hover:text-slate-300 transition-colors cursor-pointer"
              >
                <span className="text-sm">{post.title}</span>
                <span className="text-xs text-slate-500">{post.date}</span>
              </button>
              {i < sorted.length - 1 && (
                <div className="border-t border-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
