let categoriesPromise

/** Share one import promise between preloading and React.lazy. */
export function loadCategoriesPage() {
  categoriesPromise ??= import('../pages/CategoriesPage').then((module) => ({
    default: module.CategoriesPage,
  }))
  return categoriesPromise
}

export function preloadCategoriesPage() {
  return loadCategoriesPage()
}
