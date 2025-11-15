import { useMemo } from 'react'
import { projects } from './data/projects'

function DetailSection({ section }) {
  if (section.list) {
    return (
      <div>
        <h2 className="font-heading text-2xl text-white">{section.title}</h2>
        <ul className="mt-4 space-y-3 text-slate-200">
          {section.list.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-heading text-2xl text-white">{section.title}</h2>
      <p className="mt-4 text-slate-300">{section.body}</p>
    </div>
  )
}

export function ProjectDetailPage({ slug }) {
  const project = useMemo(() => projects.find((entry) => entry.slug === slug), [slug])

  if (!project) {
    return (
      <div className="min-h-screen bg-night text-slate-100">
        <main className="mx-auto max-w-4xl px-4 py-16">
          <a href="projects.html" className="text-sm uppercase tracking-[0.3em] text-slate-400">
            ← All projects
          </a>
          <h1 className="mt-6 font-heading text-3xl text-white">Project not found</h1>
          <p className="mt-3 text-slate-300">Double-check the URL or head back to the list.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night text-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <a href="projects.html" className="text-sm uppercase tracking-[0.3em] text-slate-400">
          ← All projects
        </a>
        <header className="mt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">{project.title}</p>
          <h1 className="mt-3 font-heading text-4xl text-white">{project.title}</h1>
          <p className="mt-4 text-slate-300">{project.detail?.overview ?? project.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
            {project.stack.map((tech) => (
              <span key={tech} className="rounded-full bg-white/5 px-3 py-1">
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-6 flex gap-3 text-sm font-semibold">
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-accent hover:text-accent"
            >
              GitHub ↗
            </a>
          </div>
        </header>

        <section className="glass-panel mt-12 space-y-8 rounded-3xl p-8">
          {(project.detail?.sections ?? []).map((section) => (
            <DetailSection key={section.title} section={section} />
          ))}
        </section>
      </main>
    </div>
  )
}

export default ProjectDetailPage
