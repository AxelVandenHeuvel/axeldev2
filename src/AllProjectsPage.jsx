import { projects } from './data/projects'

const AllProjectsPage = () => {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (dateString.toLowerCase() === 'current') return 'Current'
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}-${day}-${year}`
  }

  // Sort projects: "current" first, then by date (most recent first)
  const sortedProjects = [...projects].sort((a, b) => {
    const aIsCurrent = a.date?.toLowerCase() === 'current'
    const bIsCurrent = b.date?.toLowerCase() === 'current'
    
    // "current" always comes first
    if (aIsCurrent && !bIsCurrent) return -1
    if (!aIsCurrent && bIsCurrent) return 1
    
    // If both are "current" or both are dates, sort by date
    if (aIsCurrent && bIsCurrent) return 0
    
    // Sort by date (most recent first)
    const aDate = a.date ? new Date(a.date) : new Date('1970-01-01')
    const bDate = b.date ? new Date(b.date) : new Date('1970-01-01')
    return bDate - aDate
  })

  return (
    <div className="min-h-screen bg-night text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <a href="/" className="text-sm uppercase tracking-[0.3em] text-slate-400">
          ← Back home
        </a>
        <header className="mt-6 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-accent">Projects</p>
          <h1 className="mt-3 font-heading text-4xl text-white">Projects and Other Works.</h1>
          <p className="mt-4 text-slate-300">
            
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {sortedProjects.map((project, index) => (
            <article key={project.slug} className="glass-panel card-hover flex flex-col justify-between rounded-3xl p-6">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{String(index + 1).padStart(2, '0')}</p>
                  {project.date && (
                    <p className="text-xs text-slate-400">{formatDate(project.date)}</p>
                  )}
                </div>
                <h2 className="mt-4 font-heading text-2xl text-white">{project.title}</h2>
                <p className="mt-3 text-sm text-slate-300">{project.description}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
                <a
                  href={`project.html?slug=${project.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 transition hover:border-accent hover:text-accent"
                >
                  More
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default AllProjectsPage
