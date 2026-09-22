import { Link } from '../components/Link'

export function PostPage({ post, backTo }) {
  return (
    <div className="relative min-h-screen bg-[#050914] text-white font-mono">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link
          to={backTo}
          className="text-sm text-slate-400 hover:text-white mb-12 block w-fit transition-colors"
        >
          ← back
        </Link>
        <h1 className="text-2xl font-medium mb-2">{post.title}</h1>
        <span className="text-xs text-slate-500">{post.date}</span>

        {post.body && (
          <p className="text-slate-400 text-sm mt-8 whitespace-pre-line">{post.body}</p>
        )}

        {post.images?.length > 0 && (
          <div className="mt-8 space-y-6">
            {post.images.map((img) => (
              <figure key={img.src}>
                <img src={img.src} alt={img.caption || ''} className="w-full rounded-sm" />
                {img.caption && <figcaption className="text-xs text-slate-500 mt-2">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        {post.links?.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-8">
            {post.links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-sm transition-colors"
              >
                {link.label} →
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
