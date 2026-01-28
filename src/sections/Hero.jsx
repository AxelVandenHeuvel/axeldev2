import resumePdf from '../assets/Axel_VandenHeuvel_2025.pdf'

export function Hero() {
  return (
    <section id="hero" className="relative min-h-[85vh] flex items-center">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <p className="text-slate-400 mb-4">Hi, I'm</p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-white leading-tight">
          Axel VandenHeuvel
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
          Comptuer Science student as CU Boulder interested in building software
          and advancements in AI tools
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#posts"
            className="inline-flex items-center px-5 py-2.5 bg-white text-night text-sm font-medium rounded-md hover:bg-slate-100 transition-colors"
          >
            View my work
          </a>
          <a
            href={resumePdf}
            download
            className="inline-flex items-center px-5 py-2.5 border border-white/20 text-white text-sm font-medium rounded-md hover:border-white/40 transition-colors"
          >
            Resume
          </a>
        </div>
      </div>
    </section>
  )
}
