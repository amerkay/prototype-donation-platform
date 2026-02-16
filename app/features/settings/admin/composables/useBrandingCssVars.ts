import type { CSSProperties } from 'vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { getBunnyFontUrl } from '~/features/settings/admin/utils/fonts'
import { contrastForeground } from '~/features/settings/admin/utils/color-contrast'

/**
 * Returns a computed `CSSProperties` object that overrides `--primary`,
 * `--secondary`, `--accent` (+ foregrounds, ring) with the branding store's
 * hex values. Also loads the selected Bunny Font via `useHead()`.
 *
 * Bind on any container to scope branding to that subtree.
 */
export function useBrandingCssVars() {
  const store = useBrandingSettingsStore()

  const brandingStyle = computed<CSSProperties>(() => {
    return {
      '--primary': store.primaryColor,
      '--primary-foreground': contrastForeground(store.primaryColor),
      '--secondary': store.secondaryColor,
      '--secondary-foreground': contrastForeground(store.secondaryColor),
      '--ring': store.primaryColor,
      fontFamily: `${store.fontFamily}, sans-serif`
    } as CSSProperties
  })

  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: computed(() => getBunnyFontUrl(store.fontFamily))
      }
    ]
  })

  return { brandingStyle }
}
