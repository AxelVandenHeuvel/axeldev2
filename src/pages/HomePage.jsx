import { useEffect, useRef, useState } from 'react'

import { AsciiBlackHole } from '../components/AsciiBlackHole'
import { Link } from '../components/Link'
import { homeThemes, setHomeTheme, useHomeTheme } from '../lib/homeTheme'
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
      className="text-[color:var(--home-ink)] transition-colors duration-500 leading-tight font-mono select-none mx-auto w-fit"
      style={{ fontSize: NAME_FONT_SIZE }}
    >
      {lines.join('\n')}
    </pre>
  )
}

const SYMBOL_PATHS = {
  circle: <circle cx="6" cy="6" r="4.5" />,
  triangle: <path d="M6 1.5 10.5 10H1.5Z" />,
  square: <rect x="1.75" y="1.75" width="8.5" height="8.5" />,
}

/**
 * The "theme" nav item. Opens a row of unnamed schemes, each a bare
 * geometric symbol; the current one is filled. The row is positioned
 * absolutely so opening it never shifts the rest of the nav.
 */
function ThemePicker({ theme }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="theme-options"
        onClick={() => setOpen((v) => !v)}
        className={`text-left hover:underline ${open ? 'underline' : ''}`}
      >
        theme
      </button>
      {open && (
        <div
          id="theme-options"
          role="radiogroup"
          aria-label="color theme"
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 md:top-1/2 md:mt-0 md:left-full md:ml-3 md:translate-x-0 md:-translate-y-1/2 flex items-center gap-1"
        >
          {Object.entries(homeThemes).map(([key, { symbol }], i) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={theme === key}
              aria-label={`color theme ${i + 1}`}
              onClick={() => setHomeTheme(key)}
              className="grid place-items-center h-7 w-7 rounded-sm outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-1 focus-visible:ring-[color:var(--home-ink)]"
            >
              <svg
                viewBox="0 0 12 12"
                className="h-3 w-3"
                fill={theme === key ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {SYMBOL_PATHS[symbol]}
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function HomePage({ panel }) {
  const theme = useHomeTheme()
  const active = panel ? panelContent[panel] : null
  const close = () => navigate('/')

  useEffect(() => {
    if (!panel) return
    const onKey = (e) => e.key === 'Escape' && navigate('/')
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panel])

  return (
    <main
      style={{ ...homeThemes[theme].vars }}
      className="h-dvh bg-[color:var(--home-bg)] text-[color:var(--home-ink)] transition-colors duration-500 flex flex-col justify-between px-6 pt-20 pb-8 md:py-8 overflow-hidden relative">
      <nav className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-row gap-6 md:left-8 md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:flex-col md:items-start md:gap-4 items-center font-mono text-sm z-20">
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
        <ThemePicker theme={theme} />
      </nav>

      {active && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 md:p-16">
          <div className="absolute inset-0 bg-[color:var(--home-backdrop)]" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            className="relative bg-[color:var(--home-panel)] shadow-lg w-full max-w-2xl max-h-[70vh] overflow-y-auto p-8 font-mono rounded-sm"
          >
            <div className="absolute inset-2 md:inset-3 border border-[color:var(--home-panel-edge)] rounded-sm pointer-events-none" />
            <button
              onClick={close}
              aria-label="close"
              className="absolute top-5 right-6 md:top-6 md:right-7 leading-none text-[color:var(--home-muted)] hover:text-[color:var(--home-ink)] text-lg z-10"
            >
              x
            </button>
            <div className="relative px-4 py-2">
              <h2 id="panel-title" className="text-[color:var(--home-ink)] text-lg font-medium mb-4">{panel}</h2>
              {active.content && (
                <p className="text-[color:var(--home-body)] text-sm whitespace-pre-line">{active.content}</p>
              )}
              {active.links && (
                <div className="space-y-4">
                  {active.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center justify-between gap-4 py-3 border-b border-[color:var(--home-rule)] text-[color:var(--home-body)] hover:text-[color:var(--home-ink)] transition-colors"
                    >
                      <span className="text-sm text-[color:var(--home-muted)]">{link.label}</span>
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
