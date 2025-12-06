import { projects } from '../data/projects'
import { SectionHeading } from '../components/SectionHeading'

function ProjectCard({ project, index }) {
  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (dateString.toLowerCase() === 'current') return 'Current'
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}-${day}-${year}`
  }

  return (
    <div className="glass-panel card-hover flex flex-col justify-between rounded-3xl p-6">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">0{index + 1}</p>
          {project.date && (
            <p className="text-xs text-slate-400">{formatDate(project.date)}</p>
          )}
        </div>
        <h3 className="mt-4 font-heading text-2xl text-white">{project.title}</h3>
        <p className="mt-3 text-sm text-slate-300">{project.description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span key={tech} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-4 text-sm font-semibold text-white">
        <a
          href={`project.html?slug=${project.slug}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 transition hover:border-accent hover:text-accent"
        >
          More
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  )
}

export function Projects() {
  // Sort projects: "current" first, then by date (most recent first), and take top 4
  const sortedProjects = [...projects]
    .sort((a, b) => {
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
    .slice(0, 4)

  return (
    <section id="projects" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading label="Projects" />

        <div className="grid gap-6 md:grid-cols-2">
          {sortedProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="projects.html"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:border-accent hover:bg-accent/10"
          >
            View All Projects
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
