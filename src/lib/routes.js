import { projects } from '../data/projects.js'
import { travel } from '../data/travel.js'

/**
 * Every URL the site answers to. Kept free of React so the build-time
 * prerender script (scripts/prerender-routes.mjs) can import it in Node.
 *
 *   /                        home
 *   /about, /contact         home with that panel open
 *   /posts                   categories
 *   /posts/:category         post list
 *   /posts/:category/:slug   a single post
 */

const SITE_NAME = 'Axel VandenHeuvel'

export const panels = ['about', 'contact']

export const categories = {
  cs: { title: 'cs', posts: projects },
  travel: { title: 'travel', posts: travel },
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** A post may set `slug` explicitly; otherwise it is derived from the title. */
function postSlug(post) {
  return post.slug ?? slugify(post.title)
}

export function postPath(category, post) {
  return `/posts/${category}/${postSlug(post)}`
}

export function resolveRoute(path) {
  if (path === '/') return { name: 'home', title: SITE_NAME }

  const panel = path.slice(1)
  if (panels.includes(panel)) {
    return { name: 'home', panel, title: `${panel} - ${SITE_NAME}` }
  }

  const [root, category, slug, ...rest] = path.split('/').slice(1)
  if (root !== 'posts' || rest.length > 0) return notFound()
  if (!category) return { name: 'categories', title: `posts - ${SITE_NAME}` }

  const list = categories[category]
  if (!list) return notFound()
  if (!slug) {
    return { name: 'list', category, list, title: `${list.title} - ${SITE_NAME}` }
  }

  const post = list.posts.find((p) => postSlug(p) === slug)
  if (!post) return notFound()
  return { name: 'post', category, post, title: `${post.title} - ${SITE_NAME}` }
}

function notFound() {
  return { name: 'notFound', title: `not found - ${SITE_NAME}` }
}

/** Every concrete path, for prerendering. */
export function allPaths() {
  return [
    '/',
    ...panels.map((p) => `/${p}`),
    '/posts',
    ...Object.entries(categories).flatMap(([key, { posts }]) => [
      `/posts/${key}`,
      ...posts.map((post) => postPath(key, post)),
    ]),
  ]
}
