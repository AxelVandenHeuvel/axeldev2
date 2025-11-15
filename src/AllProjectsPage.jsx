import { projects } from './data/projects'

const AllProjectsPage = () => {
  return (
    <div className="min-h-screen bg-night text-slate-100">
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <a href="/" className="text-sm uppercase tracking-[0.3em] text-slate-400">
          ← Back home
        </a>
        <header className="mt-6 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-accent">Projects</p>
          <h1 className="mt-3 font-heading text-4xl text-white">Every build, in one place.</h1>
          <p className="mt-4 text-slate-300">
            
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {projects.map((project, index) => (
            <article key={project.slug} className="glass-panel card-hover flex flex-col justify-between rounded-3xl p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{String(index + 1).padStart(2, '0')}</p>
                <h2 className="mt-4 font-heading text-2xl text-white">{project.title}</h2>
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
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
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
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default AllProjectsPage
