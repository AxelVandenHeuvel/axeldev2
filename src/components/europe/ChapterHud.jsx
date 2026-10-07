import { Link } from '../Link.jsx'
import { PAPER } from './paper.js'

/**
 * Quiet chrome over the map. Destination context lives on the map itself.
 */
export function ChapterHud({ backTo }) {
  return (
    <div className="eu-chapter-hud pointer-events-none absolute inset-0 z-30">
      <div className="pointer-events-auto absolute left-4 top-4 flex items-center gap-4 sm:left-6 sm:top-6">
        <Link
          to={backTo}
          className="font-mono text-xs transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8322a]"
          style={{ color: PAPER.inkBody }}
        >
          ← back
        </Link>
      </div>
    </div>
  )
}
