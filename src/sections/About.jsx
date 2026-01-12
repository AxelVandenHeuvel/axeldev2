import { SectionHeading } from '../components/SectionHeading'

export function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading label="About" />

        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            I'm a Computer Science senior at the University of Colorado Boulder,
            graduating in 2025. Recently I've been interested in AI tools for
            development and I'm constantly looking to expand my knowledge in
            software engineering.
          </p>
          <p>
            Outside of coding, I enjoy lifting weights, hiking around Colorado,
            building mechanical keyboards, and I've recently gotten into astronomy
            from one of my classes (currently reading Cosmos by Carl Sagan).
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-slate-500 mb-2">Education</p>
          <p className="text-white font-medium">University of Colorado Boulder</p>
          <p className="text-slate-400 text-sm mt-1">B.S. Computer Science, 3.61 GPA</p>
        </div>
      </div>
    </section>
  )
}
