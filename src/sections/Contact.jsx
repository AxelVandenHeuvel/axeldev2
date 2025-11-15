import { SectionHeading } from '../components/SectionHeading'

const MailIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M4 7.5 12 13l8-5.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-accent" fill="currentColor">
    <path d="M12 .5C5.648.5.5 5.796.5 12.29c0 5.2 3.438 9.604 8.207 11.157.6.12.82-.27.82-.6 0-.3-.01-1.1-.02-2.16-3.34.75-4.04-1.66-4.04-1.66-.55-1.45-1.35-1.84-1.35-1.84-1.1-.79.09-.77.09-.77 1.21.09 1.85 1.28 1.85 1.28 1.08 1.9 2.84 1.35 3.53 1.03.11-.8.42-1.35.76-1.66-2.67-.31-5.48-1.39-5.48-6.21 0-1.37.46-2.48 1.22-3.35-.12-.31-.53-1.57.12-3.26 0 0 1-.33 3.3 1.26a11.1 11.1 0 0 1 6 0c2.3-1.59 3.29-1.26 3.29-1.26.66 1.69.25 2.95.12 3.26.76.87 1.22 1.98 1.22 3.35 0 4.84-2.82 5.89-5.5 6.2.43.38.82 1.13.82 2.3 0 1.66-.02 3-.02 3.4 0 .33.22.72.82.6 4.77-1.56 8.21-5.96 8.21-11.16C23.5 5.8 18.35.5 12 .5Z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-8 text-accent" fill="currentColor">
    <path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5ZM3 8.75h3.95V21H3zM9.69 8.75H13v1.68h.05c.46-.87 1.6-1.78 3.29-1.78 3.52 0 4.17 2.1 4.17 4.84V21h-3.95v-6.02c0-1.44-.02-3.28-2-3.28-2 0-2.31 1.56-2.31 3.17V21H9.69z" />
  </svg>
)

const socials = [
  {
    label: 'Email',
    value: 'axelvandenhe@gmail.com',
    href: 'mailto:axelvandenhe@gmail.com',
    icon: MailIcon,
  },
  {
    label: 'GitHub',
    value: '@AxelVandenHeuvel',
    href: 'https://github.com/AxelVandenHeuvel',
    icon: GitHubIcon,
  },
  {
    label: 'LinkedIn',
    value: 'Axel VandenHeuvel',
    href: 'https://www.linkedin.com/in/axel-vandenheuvel/',
    icon: LinkedInIcon,
  },
]

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading label="Contact" />

        <div className="grid gap-6 md:grid-cols-3">
          {socials.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.label}
                href={social.href}
                className="group glass-panel flex flex-col rounded-3xl p-6 transition hover:border-accent hover:bg-accent/10"
              >
                <Icon />
                <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">{social.label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{social.value}</p>
                <span className="mt-6 text-sm text-slate-300 group-hover:text-white">Reach out →</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
