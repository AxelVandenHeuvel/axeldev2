import ColorBends from '../components/ColorBends'
import { Link } from '../components/Link'

const categories = [
  { key: 'cs', label: 'cs' },
  { key: 'travel', label: 'travel' },
  { key: 'placeholder', label: '???', disabled: true },
]

export function CategoriesPage() {
  return (
    <div className="relative min-h-screen overflow-auto">
      <div className="fixed inset-0 bg-[#050914]" style={{ transform: 'translateZ(0)' }}>
        <ColorBends
          className="absolute inset-0"
          colors={["#FF0066", "#00FF88", "#0066FF"]}
          rotation={0}
          autoRotate={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0}
          parallax={0.5}
          noise={0.1}
          transparent={true}
          intensity={0.3}
        />
      </div>

      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
        <Link
          to="/"
          className="text-sm text-slate-400 hover:text-white font-mono block w-fit transition-colors mb-4"
        >
          ← back
        </Link>

        <div>
          {categories.map((cat, i) => (
            <div key={cat.key}>
              {cat.disabled ? (
                <span className="block py-6 font-mono text-lg text-slate-600 cursor-default">
                  {cat.label}
                </span>
              ) : (
                <Link
                  to={`/posts/${cat.key}`}
                  className="block py-6 font-mono text-lg text-white hover:text-slate-300 transition-colors"
                >
                  {cat.label}
                </Link>
              )}
              {i < categories.length - 1 && (
                <div className="border-t border-white/10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
