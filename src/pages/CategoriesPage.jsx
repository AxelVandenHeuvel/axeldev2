import ColorBends from '../components/ColorBends'

const categories = [
  { key: 'cs', label: 'cs' },
  { key: 'travel', label: 'travel' },
  { key: 'placeholder', label: '???', disabled: true },
]

export function CategoriesPage({ onBack, onSelect }) {
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
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white font-mono block transition-colors mb-4"
        >
          ← back
        </button>

        <div>
          {categories.map((cat, i) => (
            <div key={cat.key}>
              <button
                onClick={() => !cat.disabled && onSelect?.(cat.key)}
                disabled={cat.disabled}
                className={`w-full py-6 font-mono text-left transition-colors ${
                  cat.disabled
                    ? 'text-slate-600 cursor-default'
                    : 'text-white hover:text-slate-300 cursor-pointer'
                }`}
              >
                <span className="text-lg">{cat.label}</span>
              </button>
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
