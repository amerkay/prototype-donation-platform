import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable to determine if a URL matches the current route
 *
 * Supports both exact and partial (hierarchical) matching.
 *
 * @example
 * ```ts
 * const { isActive } = useActiveLink()
 * const isSettingsActive = isActive('/settings') // true for /settings/general
 * const isHomeActive = isActive('/', true) // true only for exactly /
 * ```
 */
export function useActiveLink() {
  const route = useRoute()

  /**
   * Check if a URL is active based on current route
   *
   * @param url - The URL to check (can be relative or with hash)
   * @param exact - If true, requires exact match. If false, matches hierarchically.
   * @returns Computed boolean indicating if the URL is active
   */
  const isActive = (url: string, exact = false): boolean => {
    // Handle hash-only links (not considered active based on route)
    if (url === '#') return false

    const currentPath = route.path
    const targetPath = url.split('?')[0]?.split('#')[0] || url // Strip query/hash

    if (exact) {
      return currentPath === targetPath
    }

    // Hierarchical matching: /campaigns matches /campaigns/id
    return currentPath === targetPath || currentPath.startsWith(targetPath + '/')
  }

  return {
    isActive: computed(() => isActive)
  }
}
