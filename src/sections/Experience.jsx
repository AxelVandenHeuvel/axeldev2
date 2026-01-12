import { SectionHeading } from '../components/SectionHeading'

const experience = {
  role: 'Cloud Solutions Intern',
  org: 'Tenet Healthcare',
  period: 'Jun 2025 — Aug 2025',
  bullets: [
    'Reclaimed unused Microsoft licensing through automated audit pipelines, generating $500K+ in annual cost savings.',
    'Integrated DocuSign API to automate reminders and compliance notifications, reducing internal document lag time.',
    'Built PowerShell automation to detect misconfigurations and manage entitlement workflows across 10,000+ users.',
  ],
}

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading label="Experience" />

        <div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
            <div>
              <h3 className="text-white font-medium">{experience.role}</h3>
              <p className="text-slate-400 text-sm">{experience.org}</p>
            </div>
            <p className="text-sm text-slate-500">{experience.period}</p>
          </div>

          <ul className="mt-6 space-y-3">
            {experience.bullets.map((item, i) => (
              <li key={i} className="text-slate-300 text-sm leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-slate-600 before:rounded-full">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
