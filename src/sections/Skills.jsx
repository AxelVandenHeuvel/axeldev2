import { skills } from '../data/skills'
import { SectionHeading } from '../components/SectionHeading'

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading label="Skills" />

        <div className="grid gap-6 md:grid-cols-3">
          {skills.map((group) => (
            <div key={group.category} className="glass-panel rounded-3xl p-6">
              <h3 className="font-heading text-xl text-white">{group.category}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
