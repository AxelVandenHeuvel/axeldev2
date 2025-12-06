import { useMemo } from 'react'
import { projects } from './data/projects'

function DetailSection({ section }) {
  // Handle image sections
  if (section.type === 'image') {
    return (
      <div className="my-8">
        <img
          src={section.src}
          alt={section.alt || ''}
          className="w-full rounded-2xl"
        />
        {section.caption && (
          <p className="mt-2 text-center text-sm text-slate-400">{section.caption}</p>
        )}
      </div>
    )
  }

  // Handle list sections
  if (section.list) {
    return (
      <div>
        <h2 className="font-heading text-2xl text-white">{section.title}</h2>
        <ul className="mt-4 space-y-3 text-slate-200">
          {section.list.map((item, idx) => (
            <li key={idx}>• {item}</li>
          ))}
        </ul>
      </div>
    )
  }

  // Handle text sections
  return (
    <div>
      {section.title && (
        <h2 className="font-heading text-2xl text-white">{section.title}</h2>
      )}
      {section.body && (
        <p className={`mt-4 text-slate-300 ${section.title ? '' : 'text-base'}`}>
          {section.body}
        </p>
      )}
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

  // Get buttons from detail.buttons or default to GitHub if available
  const buttons = project.detail?.buttons || []
  const hasDefaultGitHub = project.github && !buttons.some(btn => btn.label.toLowerCase() === 'github')

  return (
    <div className="min-h-screen bg-night text-slate-100">
      <main className="mx-auto max-w-4xl px-4 py-16">
        <a href="projects.html" className="text-sm uppercase tracking-[0.3em] text-slate-400">
          ← All projects
        </a>
        <header className="mt-6">
          <h1 className="font-heading text-4xl text-white">{project.title}</h1>
          <p className="mt-4 text-slate-300">{project.detail?.overview ?? project.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
            {project.stack.map((tech) => (
              <span key={tech} className="rounded-full bg-white/5 px-3 py-1">
                {tech}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            {/* Render custom buttons from detail.buttons */}
            {buttons.map((button, idx) => (
              <a
                key={idx}
                href={button.href}
                target={button.external ? '_blank' : undefined}
                rel={button.external ? 'noreferrer' : undefined}
                className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-accent hover:text-accent"
              >
                {button.label}
                {button.external && <span className="ml-1">↗</span>}
              </a>
            ))}
            {/* Default GitHub button if no custom buttons and GitHub exists */}
            {hasDefaultGitHub && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/20 px-5 py-2 text-white transition hover:border-accent hover:text-accent"
              >
                GitHub ↗
              </a>
            )}
          </div>
        </header>

        <section className="glass-panel mt-12 space-y-8 rounded-3xl p-8">
          {(project.detail?.sections ?? []).map((section, idx) => (
            <DetailSection key={section.title || `section-${idx}`} section={section} />
          ))}
        </section>
      </main>
    </div>
  )
}

export default ProjectDetailPage
