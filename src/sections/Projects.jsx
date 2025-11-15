import { projects } from '../data/projects'
import { SectionHeading } from '../components/SectionHeading'

function ProjectCard({ project, index }) {
  return (
    <div className="glass-panel card-hover flex flex-col justify-between rounded-3xl p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">0{index + 1}</p>
        <h3 className="mt-4 font-heading text-2xl text-white">{project.title}</h3>
        <p className="mt-3 text-sm text-slate-300">{project.description}</p>
        <p className="mt-4 text-sm text-emerald-200">{project.highlight}</p>
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
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 transition hover:border-accent hover:text-accent"
        >
          GitHub
          <span aria-hidden="true">↗</span>
        </a>
        <a
          href={`project.html?slug=${project.slug}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 px-4 py-2 transition hover:border-accent hover:text-accent"
        >
          Deep Dive
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading label="Projects" />

        <div className="grid gap-6 md:grid-cols-2">
          {projects.slice(0, 4).map((project, index) => (
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
