import { useSyncExternalStore } from 'react'

/**
 * Color schemes for the home page. Deliberately unnamed in the UI; the keys
 * are for code only. The alternates follow two GMK keycap sets:
 *
 *   vaporwave   Pantone 271C lavender, 2097C violet, 806C pink, 915C teal
 *               (text uses the teal slightly deepened to #1d9ead; the chip value is
 *               too faint on lavender for thin ASCII strokes)
 *   nightrunner near-black alphas, indigo mods, chartreuse legends
 *
 * Each theme is a set of CSS custom properties applied to the home page root.
 * `symbol` is the plain shape the picker shows for it.
 */
export const homeThemes = {
  classic: {
    symbol: 'circle',
    vars: {
      '--home-bg': '#f2ebe0',
      '--home-ink': '#262626',
      '--home-hole': '#262626',
      '--home-glow': '#f97316',
      '--home-panel': '#f2ebe0',
      '--home-panel-edge': '#262626',
      '--home-body': '#525252',
      '--home-muted': '#a3a3a3',
      '--home-rule': '#d4d4d4',
      '--home-backdrop': 'rgba(0, 0, 0, 0.1)',
    },
  },
  vaporwave: {
    symbol: 'triangle',
    vars: {
      '--home-bg': '#cbc4f0',
      '--home-ink': '#1d9ead',
      '--home-hole': '#5541a8',
      '--home-glow': '#ff3eb5',
      '--home-panel': '#d9d4f6',
      '--home-panel-edge': '#25adbb',
      '--home-body': '#4a36a0',
      '--home-muted': '#7d71c4',
      '--home-rule': '#aea6e2',
      '--home-backdrop': 'rgba(85, 65, 168, 0.18)',
    },
  },
  nightrunner: {
    symbol: 'square',
    vars: {
      '--home-bg': '#1f2024',
      '--home-ink': '#d6e03f',
      '--home-hole': '#9591d6',
      '--home-glow': '#7a72f0',
      '--home-panel': '#3d3a66',
      '--home-panel-edge': '#d6e03f',
      '--home-body': '#e4e9a0',
      '--home-muted': '#a9a6d8',
      '--home-rule': '#57538a',
      '--home-backdrop': 'rgba(0, 0, 0, 0.4)',
    },
  },
}

const STORAGE_KEY = 'home-theme'
const CHANGE_EVENT = 'home-theme-change'

// Held in memory so switching works even when storage is unavailable
// (private mode, blocked site data); storage only carries it across visits.
let current = null

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && Object.hasOwn(homeThemes, saved)) return saved
  } catch {
    // Unavailable storage just means the default theme.
  }
  return 'classic'
}

function read() {
  if (current === null) current = load()
  return current
}

function subscribe(callback) {
  // Another tab changed it.
  const onStorage = (e) => {
    if (e.key !== STORAGE_KEY) return
    current = load()
    callback()
  }
  window.addEventListener(CHANGE_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

export function useHomeTheme() {
  return useSyncExternalStore(subscribe, read)
}

export function setHomeTheme(key) {
  current = key
  try {
    localStorage.setItem(STORAGE_KEY, key)
  } catch {
    // Not persisted across visits, but applied for this one.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}
