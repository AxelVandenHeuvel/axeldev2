import { useMemo } from 'react'
import { posts } from './data/posts'

function DetailSection({ section }) {
  if (section.type === 'image') {
    return (
      <div className="my-8">
        <img
          src={section.src}
          alt={section.alt || ''}
          className="w-full rounded-lg"
        />
        {section.caption && (
          <p className="mt-3 text-sm text-slate-500">{section.caption}</p>
        )}
      </div>
    )
  }

  if (section.type === 'quote') {
    return (
      <div className="my-8 border-l-2 border-white/20 pl-6">
        <blockquote className="text-slate-200 italic">
          "{section.text}"
        </blockquote>
        {section.author && (
          <p className="mt-3 text-sm text-slate-500">— {section.author}</p>
        )}
      </div>
    )
  }

  if (section.type === 'code') {
    return (
      <div className="my-8">
        <pre className="overflow-x-auto rounded-lg bg-black/30 p-4 text-sm">
          <code className={`language-${section.language || 'text'}`}>
            {section.code}
          </code>
        </pre>
        {section.caption && (
          <p className="mt-3 text-sm text-slate-500">{section.caption}</p>
        )}
      </div>
    )
  }

  if (section.type === 'link') {
    return (
      <div className="my-6">
        <a
          href={section.href}
          target={section.external ? '_blank' : undefined}
          rel={section.external ? 'noreferrer' : undefined}
          className="text-white underline hover:no-underline"
        >
          {section.label || section.href}
          {section.external && <span className="ml-1">↗</span>}
        </a>
      </div>
    )
  }

  if (section.list) {
    return (
      <div>
        <h2 className="text-xl font-medium text-white">{section.title}</h2>
        <ul className="mt-4 space-y-2 text-slate-300">
          {section.list.map((item, idx) => (
            <li key={idx} className="pl-4 relative before:absolute before:left-0 before:top-2.5 before:w-1 before:h-1 before:bg-slate-600 before:rounded-full">
              {item}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      {section.title && (
        <h2 className="text-xl font-medium text-white">{section.title}</h2>
      )}
      {section.body && (
        <p className="mt-4 text-slate-300 leading-relaxed">{section.body}</p>
      )}
    </div>
  )
}

export function PostDetailPage({ slug }) {
  const post = useMemo(() => posts.find((entry) => entry.slug === slug), [slug])

  if (!post) {
    return (
      <div className="min-h-screen bg-night text-slate-300">
        <main className="mx-auto max-w-3xl px-6 py-16">
          <a href="posts.html" className="text-sm text-slate-500 hover:text-white transition-colors">
            ← All posts
          </a>
          <h1 className="mt-12 text-2xl font-medium text-white">Post not found</h1>
          <p className="mt-3 text-slate-400">Double-check the URL or head back to the list.</p>
        </main>
      </div>
    )
  }

  const buttons = post.detail?.buttons || []
  const hasDefaultGitHub = post.github && !buttons.some(btn => btn.label.toLowerCase() === 'github')

  return (
    <div className="min-h-screen bg-night text-slate-300">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <a href="posts.html" className="text-sm text-slate-500 hover:text-white transition-colors">
          ← All posts
        </a>

        <header className="mt-12">
          <h1 className="text-3xl font-semibold text-white">{post.title}</h1>
          <p className="mt-4 text-slate-300 leading-relaxed">
            {post.detail?.overview ?? post.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {post.stack.map((tech) => (
              <span key={tech} className="text-sm text-slate-500">
                {tech}
              </span>
            ))}
          </div>

          {(buttons.length > 0 || hasDefaultGitHub) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {buttons.map((button, idx) => (
                <a
                  key={idx}
                  href={button.href}
                  target={button.external ? '_blank' : undefined}
                  rel={button.external ? 'noreferrer' : undefined}
                  className="inline-flex items-center px-4 py-2 border border-white/20 text-sm text-white rounded-md hover:border-white/40 transition-colors"
                >
                  {button.label}
                  {button.external && <span className="ml-1">↗</span>}
                </a>
              ))}
              {hasDefaultGitHub && (
                <a
                  href={post.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-white/20 text-sm text-white rounded-md hover:border-white/40 transition-colors"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          )}
        </header>

        <section className="mt-16 space-y-8">
          {(post.detail?.sections ?? []).map((section, idx) => (
            <DetailSection key={section.title || `section-${idx}`} section={section} />
          ))}
        </section>
      </main>
    </div>
  )
}

export default PostDetailPage
