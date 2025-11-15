import { SectionHeading } from '../components/SectionHeading'

const experience = {
  role: 'Cloud Solutions Intern',
  org: 'Tenet Healthcare',
  period: 'Jun 2025 — Aug 2025',
  bullets: [
    'Reclaimed unused Microsoft licensing through automated audit pipelines, generating $500K+ in annual cost savings.',
    'Integrated DocuSign API to automate reminders and compliance notifications, reducing internal document lag time',
    'Built PowerShell automation to detect misconfigurations and manage entitlement workflows across 10,000+ users.',
  ],
}

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading label="Experience" />
        <div className="glass-panel rounded-3xl p-8">
          <div className="flex flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{experience.period}</p>
              <h3 className="mt-2 font-heading text-2xl text-white">{experience.role}</h3>
              <p className="text-sm text-slate-300">{experience.org}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-4 text-slate-200">
            {experience.bullets.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
