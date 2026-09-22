import { useSyncExternalStore } from 'react'

/**
 * A deliberately tiny History API router. The site has a handful of routes,
 * so a dependency would cost more than it saves.
 *
 * Deep links work on GitHub Pages because scripts/prerender-routes.mjs writes
 * an index.html for every known route at build time; anything else falls
 * through to 404.html, which boots the same app and renders the not-found page.
 */

const NAVIGATE_EVENT = 'app:navigate'

function subscribe(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener(NAVIGATE_EVENT, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(NAVIGATE_EVENT, callback)
  }
}

/** Trailing slashes are tolerated so /posts/ and /posts resolve the same. */
function getPath() {
  const path = window.location.pathname.replace(/\/+$/, '')
  return path === '' ? '/' : path
}

export function usePath() {
  return useSyncExternalStore(subscribe, getPath)
}

export function navigate(to, { replace = false } = {}) {
  if (to === getPath()) return
  window.history[replace ? 'replaceState' : 'pushState'](null, '', to)
  window.scrollTo(0, 0)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
}
