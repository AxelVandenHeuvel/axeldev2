import { Link } from '../components/Link'

export function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-[#f2ebe0] flex flex-col items-center justify-center gap-6 px-6 font-mono text-neutral-800">
      <p className="text-sm">nothing out here.</p>
      <Link to="/" className="text-sm hover:underline">
        ← home
      </Link>
    </div>
  )
}
