import { useRoute } from 'vue-router'

/**
 * Composable to determine if a URL matches the current route
 *
 * Returns reactive functions that automatically track route changes.
 * The route object from vue-router is already reactive, so these functions
 * will trigger re-renders when the route changes.
 *
 * @example
 * ```ts
 * const { isActive, hasActiveChild } = useActiveLink()
 *
 * // In template or computed:
 * isActive('/settings') // true for /settings/general
 * isActive('/', true) // true only for exactly /
 * hasActiveChild([{ url: '/settings/currency' }]) // true if any child is active
 * ```
 */
export function useActiveLink() {
  const route = useRoute()

  /**
   * Check if a URL is active based on current route
   *
   * @param url - The URL to check (can be relative or with hash)
   * @param exact - If true, requires exact match. If false, matches hierarchically.
   * @returns Boolean indicating if the URL is active
   */
  const isActive = (url: string, exact = false): boolean => {
    // Handle hash-only links (not considered active based on route)
    if (url === '#') return false

    const currentPath = route.path
    const targetPath = url.split('?')[0]?.split('#')[0] || url // Strip query/hash

    if (exact) {
      return currentPath === targetPath
    }

    // Hierarchical matching: /settings matches /settings/currency
    return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
  }

  /**
   * Check if any child item is active
   *
   * Useful for determining if a parent nav item should be expanded
   * when one of its children matches the current route.
   *
   * @param items - Array of child items with url property
   * @returns True if any child URL matches the current route
   */
  const hasActiveChild = (items?: Array<{ url: string }>): boolean => {
    if (!items?.length) return false
    return items.some((item) => isActive(item.url))
  }

  return {
    isActive,
    hasActiveChild
  }
}
