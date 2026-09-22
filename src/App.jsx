import { Suspense, lazy, useEffect } from 'react'

import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostPage } from './pages/PostPage'
import { PostsPage } from './pages/PostsPage'
import { homeThemes, useHomeTheme } from './lib/homeTheme'
import { usePath } from './lib/router'
import { resolveRoute } from './lib/routes'

// Lazy so three.js (the ColorBends shader) stays out of the homepage bundle.
const CategoriesPage = lazy(() =>
  import('./pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
)

// Posts can opt into a bespoke page via a `view` field. Lazy so the map data
// and cutscene machinery stay out of the homepage bundle.
const customViews = {
  europe2026: {
    Component: lazy(() => import('./pages/Europe2026Page')),
    background: '#e8dcc0',
  },
}

const CREAM = '#f2ebe0'
const NIGHT = '#050914'

/** Matched on <html> so overscroll and lazy-load gaps never flash the wrong color. */
function backgroundFor(route, homeTheme) {
  if (route.name === 'home') return homeThemes[homeTheme].vars['--home-bg']
  if (route.name === 'notFound') return CREAM
  return customViews[route.post?.view]?.background ?? NIGHT
}

function App() {
  const path = usePath()
  const route = resolveRoute(path)

  const homeTheme = useHomeTheme()
  const background = backgroundFor(route, homeTheme)

  useEffect(() => {
    document.title = route.title
  }, [route.title])

  useEffect(() => {
    document.documentElement.style.backgroundColor = background
  }, [background])

  switch (route.name) {
    case 'home':
      return <HomePage panel={route.panel} />

    case 'categories':
      return (
        <Suspense fallback={null}>
          <CategoriesPage />
        </Suspense>
      )

    case 'list':
      return <PostsPage category={route.category} title={route.list.title} posts={route.list.posts} />

    case 'post': {
      const backTo = `/posts/${route.category}`
      const view = customViews[route.post.view]
      if (view) {
        return (
          <Suspense fallback={null}>
            <view.Component backTo={backTo} />
          </Suspense>
        )
      }
      return <PostPage post={route.post} backTo={backTo} />
    }

    default:
      return <NotFoundPage />
  }
}

export default App
