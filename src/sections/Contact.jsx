import { SectionHeading } from '../components/SectionHeading'

const links = [
  {
    label: 'Email',
    value: 'axelvandenhe@gmail.com',
    href: 'mailto:axelvandenhe@gmail.com',
  },
  {
    label: 'GitHub',
    value: 'AxelVandenHeuvel',
    href: 'https://github.com/AxelVandenHeuvel',
  },
  {
    label: 'LinkedIn',
    value: 'Axel VandenHeuvel',
    href: 'https://www.linkedin.com/in/axel-vandenheuvel/',
  },
]

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading label="Contact" />

        <div className="space-y-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center justify-between py-3 border-b border-white/5 text-slate-300 hover:text-white transition-colors group"
              target={link.href.startsWith('http') ? '_blank' : undefined}
              rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <span className="text-sm text-slate-500">{link.label}</span>
              <span className="group-hover:underline">{link.value}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
