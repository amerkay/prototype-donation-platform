import type { RouterConfig } from '@nuxt/schema'

// https://router.vuejs.org/api/interfaces/routeroptions.html#routes
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // Restore saved position for browser back/forward (non-hash navigation)
    if (savedPosition) {
      return savedPosition
    }

    // For hash navigation, return false to disable Vue Router's scroll
    // useHashTarget handles scrolling after accordion/tab expansion settles
    // This prevents race condition with useScrollOnVisible
    if (to.hash) {
      return false
    }

    // Default: scroll to top for new page navigation
    return { top: 0, behavior: 'smooth' }
  }
}
