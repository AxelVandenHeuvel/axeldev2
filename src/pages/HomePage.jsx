import { useEffect } from 'react'

import { AsciiBlackHole } from '../components/AsciiBlackHole'
import { Link } from '../components/Link'
import { navigate } from '../lib/router'
import { panels } from '../lib/routes'

const panelContent = {
  about: {
    content: `Education\n\nUniversity of Colorado Boulder\nB.S. Computer Science, 3.66 GPA`,
  },
  contact: {
    links: [
      { label: 'Email', value: 'axelvandenhe@gmail.com', href: 'mailto:axelvandenhe@gmail.com' },
      { label: 'GitHub', value: 'AxelVandenHeuvel', href: 'https://github.com/AxelVandenHeuvel' },
      { label: 'LinkedIn', value: 'Axel VandenHeuvel', href: 'https://www.linkedin.com/in/axel-vandenheuvel/' },
    ],
  },
}

// FIGlet "Slant". Regenerate with: npx figlet -f Slant "AXEL"
const FIRST_NAME = [
  '    ___   _  __ ________',
  '   /   | | |/ // ____/ /',
  '  / /| | |   // __/ / /',
  ' / ___ |/   |/ /___/ /___',
  '/_/  |_/_/|_/_____/_____/',
]

const LAST_NAME = [
  ' _    _____    _   ______  _______   ____  __________  ___    __________',
  '| |  / /   |  / | / / __ \\/ ____/ | / / / / / ____/ / / / |  / / ____/ /',
  '| | / / /| | /  |/ / / / / __/ /  |/ / /_/ / __/ / / / /| | / / __/ / /',
  '| |/ / ___ |/ /|  / /_/ / /___/ /|  / __  / /___/ /_/ / | |/ / /___/ /___',
  '|___/_/  |_/_/ |_/_____/_____/_/ |_/_/ /_/_____/\\____/  |___/_____/_____/',
]

/**
 * Sized from the viewport so the 73-column last name always fits inside the
 * 1.5rem gutters (a monospace cell is ~0.6em, so 73 columns is ~44em), capped
 * at 15px on wide screens. Both names share the size so they read as a pair.
 */
const NAME_FONT_SIZE = 'clamp(6px, calc((100vw - 3rem) / 44), 15px)'

function NameArt({ lines }) {
  return (
    <pre
      aria-hidden="true"
      className="text-neutral-800 leading-tight font-mono select-none mx-auto w-fit"
      style={{ fontSize: NAME_FONT_SIZE }}
    >
      {lines.join('\n')}
    </pre>
  )
}

export function HomePage({ panel }) {
  const active = panel ? panelContent[panel] : null
  const close = () => navigate('/')

  useEffect(() => {
    if (!panel) return
    const onKey = (e) => e.key === 'Escape' && navigate('/')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  return (
    <main className="h-dvh bg-[#f2ebe0] flex flex-col justify-between px-6 pt-14 pb-8 md:py-8 overflow-hidden relative">
      <nav className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-row gap-6 md:left-8 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:flex-col md:gap-4 font-mono text-sm text-neutral-800 z-20">
        {panels.map((link) => (
          <Link
            key={link}
            to={panel === link ? '/' : `/${link}`}
            aria-current={panel === link ? 'page' : undefined}
            className="text-left hover:underline"
          >
            {link}
          </Link>
        ))}
      </nav>

      {active && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-16">
          <div className="absolute inset-0 bg-black/10" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            className="relative bg-[#f2ebe0] shadow-lg w-full max-w-2xl max-h-[70vh] overflow-y-auto p-8 font-mono rounded-sm"
          >
            <div className="absolute inset-2 md:inset-3 border border-neutral-800 rounded-sm pointer-events-none" />
            <button
              onClick={close}
              aria-label="close"
              className="absolute top-5 right-6 md:top-6 md:right-7 leading-none text-neutral-400 hover:text-neutral-800 text-lg z-10"
            >
              x
            </button>
            <div className="relative px-4 py-2">
              <h2 id="panel-title" className="text-neutral-800 text-lg font-medium mb-4">{panel}</h2>
              {active.content && (
                <p className="text-neutral-600 text-sm whitespace-pre-line">{active.content}</p>
              )}
              {active.links && (
                <div className="space-y-4">
                  {active.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between gap-4 py-3 border-b border-neutral-300 text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      <span className="text-sm text-neutral-400">{link.label}</span>
                      <span className="hover:underline break-all text-right">{link.value}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <h1 className="sr-only">Axel VandenHeuvel</h1>
      <NameArt lines={FIRST_NAME} />

      <AsciiBlackHole onEnter={() => navigate('/posts')} />

      <NameArt lines={LAST_NAME} />
    </main>
  )
}
