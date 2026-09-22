/**
 * Writes an index.html for every route into dist/, so deep links like
 * /posts/travel/europe-2026 are served with a 200 by GitHub Pages instead of
 * falling through to 404.html. Runs as `postbuild`.
 *
 * Each copy is the same SPA shell with the route's <title> filled in, so tabs,
 * history, and link previews read correctly before JavaScript runs.
 *
 * 404.html is the shell too: unknown paths still boot the app, which renders
 * its not-found page.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { allPaths, resolveRoute } from '../src/lib/routes.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const shell = await readFile(join(dist, 'index.html'), 'utf8')

function withTitle(title) {
  const escaped = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return shell.replace(/<title>.*?<\/title>/, `<title>${escaped}</title>`)
}

for (const path of allPaths()) {
  if (path === '/') continue
  const file = join(dist, path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, withTitle(resolveRoute(path).title))
}

await writeFile(join(dist, '404.html'), withTitle(resolveRoute('/404').title))

console.log(`prerendered ${allPaths().length - 1} routes + 404.html`)
