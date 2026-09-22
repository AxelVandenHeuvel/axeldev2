import { useMemo } from 'react'

import { Link } from '../components/Link'
import { newestFirst } from '../lib/dates'
import { postPath } from '../lib/routes'

export function PostsPage({ category, title, posts }) {
  const sorted = useMemo(() => newestFirst(posts), [posts])

  return (
    <div className="relative min-h-screen overflow-auto bg-[#050914]">
      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
        <Link
          to="/posts"
          className="text-sm text-slate-400 hover:text-white font-mono block w-fit transition-colors mb-4"
        >
          ← back
        </Link>
        <h1 className="text-white text-2xl font-mono font-medium mb-8">{title}</h1>

        <div>
          {sorted.length === 0 && (
            <p className="text-sm text-slate-500 font-mono">nothing here yet.</p>
          )}
          {sorted.map((post, i) => (
            <div key={post.title}>
              <Link
                to={postPath(category, post)}
                className="w-full flex items-center justify-between gap-4 py-4 font-mono text-white hover:text-slate-300 transition-colors"
              >
                <span className="text-sm">{post.title}</span>
                <span className="text-xs text-slate-500 shrink-0">{post.date}</span>
              </Link>
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
