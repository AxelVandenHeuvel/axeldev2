import { posts } from '../data/posts'
import { SectionHeading } from '../components/SectionHeading'

function PostCard({ post }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (dateString.toLowerCase() === 'current') return 'Ongoing'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <a
      href={`post.html?slug=${post.slug}`}
      className="group block py-6 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-4 px-4 rounded transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium group-hover:text-slate-100">
            {post.title}
          </h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">
            {post.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs text-slate-500"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        <span className="text-sm text-slate-500 shrink-0">
          {formatDate(post.date)}
        </span>
      </div>
    </a>
  )
}

export function Posts() {
  const sortedPosts = [...posts]
    .sort((a, b) => {
      const aIsCurrent = a.date?.toLowerCase() === 'current'
      const bIsCurrent = b.date?.toLowerCase() === 'current'

      if (aIsCurrent && !bIsCurrent) return -1
      if (!aIsCurrent && bIsCurrent) return 1
      if (aIsCurrent && bIsCurrent) return 0

      const aDate = a.date ? new Date(a.date) : new Date('1970-01-01')
      const bDate = b.date ? new Date(b.date) : new Date('1970-01-01')
      return bDate - aDate
    })
    .slice(0, 4)

  return (
    <section id="posts" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading label="Work" />

        <div>
          {sortedPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="mt-8">
          <a
            href="posts.html"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            View all posts →
          </a>
        </div>
      </div>
    </section>
  )
}
