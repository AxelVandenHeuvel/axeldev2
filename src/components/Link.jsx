import { navigate } from '../lib/router'

/**
 * A real <a href> so links can be opened in a new tab, copied, and crawled,
 * with plain left-clicks handled client-side.
 */
export function Link({ to, onClick, ...props }) {
  const handleClick = (e) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return
    }
    e.preventDefault()
    navigate(to)
  }

  return <a href={to} onClick={handleClick} {...props} />
}
