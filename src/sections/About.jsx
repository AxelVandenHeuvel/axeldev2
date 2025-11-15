import { SectionHeading } from '../components/SectionHeading'

const aboutSummary =
  "Hi, I'm Axel, a Computer Science senior at the University of Colorado Boulder. I'm deeply curious about AI systems, and Software Engineering. I have a strong technical aptitude, communication, and problem-solving skills. I am very intereseted in growing my experiences and knowledge."

const cards = [
  {
    title: 'Education',
    subtitle: 'University of Colorado Boulder',
    details: ['B.S. Computer Science', '3.61 GPA', '2021 — Present'],
  },
]

export function About() {
  return (
    <section id="about" className="relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <SectionHeading label="About" align="center" />
        <p className="mx-auto max-w-3xl text-base text-slate-300">{aboutSummary}</p>

        <div className="mt-10 flex justify-center">
          {cards.map((card) => (
            <div key={card.title} className="glass-panel w-full max-w-xl rounded-3xl p-8 text-left">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{card.title}</p>
              <h3 className="mt-3 font-heading text-2xl text-white">{card.subtitle}</h3>
              <ul className="mt-6 space-y-3 text-slate-200">
                {card.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
