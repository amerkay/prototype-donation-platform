import type { CSSProperties } from 'vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { getBunnyFontUrl } from '~/features/settings/admin/utils/fonts'

/**
 * WCAG relative luminance from a hex color.
 * Used to pick a readable foreground (light/dark) for a given background.
 */
function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/**
 * Return white or dark foreground hex based on background luminance.
 * Uses a threshold of 0.4 to ensure darker text on lighter backgrounds.
 */
function contrastForeground(hex: string): string {
  return relativeLuminance(hex) > 0.4 ? '#1c1917' : '#ffffff'
}

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
