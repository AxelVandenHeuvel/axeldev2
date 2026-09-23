import { useState } from 'react'

import { ColorBends } from '../components/ColorBends'
import { GlitchArt } from '../components/GlitchArt'
import { Link } from '../components/Link'
import { categories } from '../lib/routes'

// FIGlet "Slant", matching the name on the home page.
const titles = {
  cs: [
    '  __________',
    ' / ___/ ___/',
    '/ /__(__  )',
    '\\___/____/',
  ],
  travel: [
    '   __                        __',
    '  / /__________ __   _____  / /',
    ' / __/ ___/ __ `/ | / / _ \\/ /',
    '/ /_/ /  / /_/ /| |/ /  __/ /',
    '\\__/_/   \\__,_/ |___/\\___/_/',
  ],
  unknown: [
    '  ___  ___  ___',
    ' /__ \\/__ \\/__ \\',
    '  / _/ / _/ / _/',
    ' /_/  /_/  /_/',
    '(_)  (_)  (_)',
  ],
}

/**
 * Sized so the widest title ("travel", 31 columns, ~18.7em) spans the phone
 * width inside the 1.5rem gutters, capped at 22px on wide screens.
 */
const TITLE_STYLE = { fontSize: 'clamp(10px, calc((100vw - 3rem) / 18.7), 22px)' }
const TITLE_CLASS = 'font-mono leading-tight select-none w-fit'

const BEND_COLORS = ['#FF0066', '#00FF88', '#0066FF']

export function CategoriesPage() {
  // Which entry is hovered or focused; the background leans in while set.
  const [active, setActive] = useState(null)
  const track = (key) => ({
    onPointerEnter: () => setActive(key),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(key),
    onBlur: () => setActive(null),
  })

  return (
    <div className="relative min-h-dvh">
      <div className="fixed inset-0 bg-[#050914]" style={{ transform: 'translateZ(0)' }}>
        <ColorBends
          className="absolute inset-0"
          colors={BEND_COLORS}
          rotation={0}
          autoRotate={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={active ? 1.2 : 0.4}
          parallax={0.5}
          noise={0.1}
          transparent={true}
          intensity={active ? 0.5 : 0.3}
        />
      </div>

      <div className="relative z-10 min-h-dvh flex flex-col px-6 py-8 max-w-2xl mx-auto">
        <Link
          to="/"
          className="text-sm text-slate-400 hover:text-white font-mono block w-fit transition-colors"
        >
          ← escape
        </Link>

        <nav aria-label="categories" className="flex-1 flex flex-col justify-center gap-12 py-16">
          {Object.entries(categories).map(([key, { title }], i) => (
            <Link
              key={key}
              to={`/posts/${key}`}
              className="group block w-fit motion-safe:animate-rise"
              style={{ animationDelay: `${i * 80}ms` }}
              {...track(key)}
            >
              <span className="sr-only">{title}</span>
              <pre
                aria-hidden="true"
                className={`${TITLE_CLASS} text-white/80 transition duration-300 group-hover:text-white group-hover:translate-x-1.5 group-focus-visible:text-white`}
                style={TITLE_STYLE}
              >
                {titles[key].join('\n')}
              </pre>
            </Link>
          ))}

          <div
            className="w-fit cursor-default motion-safe:animate-rise"
            style={{ animationDelay: `${Object.keys(categories).length * 80}ms` }}
            {...track('unknown')}
          >
            <span className="sr-only">coming soon</span>
            <GlitchArt
              lines={titles.unknown}
              intense={active === 'unknown'}
              className={`${TITLE_CLASS} text-slate-500`}
              style={TITLE_STYLE}
            />
          </div>
        </nav>
      </div>
    </div>
  )
}
