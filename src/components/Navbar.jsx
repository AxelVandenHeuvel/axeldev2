import { useEffect, useState } from 'react'

const links = [
  { href: '#hero', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const close = () => setIsOpen(false)
    window.addEventListener('scroll', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-xl bg-night/80 shadow-lg shadow-slate-900/50' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-sm font-medium sm:px-6">
        <a href="#hero" className="font-heading text-lg tracking-tight text-white">
          Axel <span className="text-accent">VandenHeuvel</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-200 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <button
          className="ml-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white transition hover:border-accent md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <div className="relative h-5 w-5">
            <span
              className={`absolute left-1/2 top-0 h-0.5 w-5 -translate-x-1/2 bg-current transition ${
                isOpen ? 'translate-y-2.5 rotate-45' : ''
              }`}
            />
            <span
              className={`absolute left-1/2 top-1/2 h-0.5 w-5 -translate-x-1/2 -translate-y-1/2 bg-current transition ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`absolute left-1/2 bottom-0 h-0.5 w-5 -translate-x-1/2 bg-current transition ${
                isOpen ? '-translate-y-2.5 -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {isOpen && (
        <div className="glass-panel mx-4 mb-4 rounded-3xl p-6 md:hidden">
          <div className="flex flex-col gap-4 text-base">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="text-slate-100" onClick={() => setIsOpen(false)}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
