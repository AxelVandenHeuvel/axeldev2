import resumePdf from '../assets/Axel_VandenHeuvel_2025.pdf'

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-32 pb-36 sm:pt-40 sm:pb-48 min-h-[90vh]">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pt-12 text-center sm:px-6 sm:pt-20">
        <h1 className="font-heading text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
          Axel VandenHeuvel
        </h1>
        <p className="mt-3 text-xl text-slate-300">
          
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 font-semibold text-night transition hover:-translate-y-0.5"
          >
            View Projects
            <span className="ml-2 transition group-hover:translate-x-1">→</span>
          </a>
          <a
            href={resumePdf}
            download
            className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:border-accent hover:bg-accent/10"
          >
            Download Resume
          </a>
        </div>

      </div>
    </section>
  )
}
