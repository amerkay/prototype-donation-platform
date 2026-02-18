import type { CSSProperties, InjectionKey, ComputedRef } from 'vue'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { getBunnyFontUrl } from '~/features/settings/admin/utils/fonts'
import { contrastForeground } from '~/features/settings/admin/utils/color-contrast'

/**
 * Injection key for branding style. Components that call `useBrandingCssVars()`
 * and `provide(BRANDING_STYLE_KEY, brandingStyle)` make branding available to
 * all descendants — including teleported dialogs/drawers (Vue preserves the
 * logical component tree across Teleport).
 */
export const BRANDING_STYLE_KEY: InjectionKey<ComputedRef<CSSProperties>> = Symbol('branding-style')

/**
 * Inject branding style from a parent provider. Returns the computed style
 * or undefined if no provider exists (e.g. admin pages without branding).
 * Use in teleported components (BaseDialogOrDrawer, Dialog) to inherit branding.
 */
export function useInjectedBrandingStyle() {
  return inject(BRANDING_STYLE_KEY, undefined)
}

/**
 * Returns a computed `CSSProperties` object that overrides `--primary`,
 * `--secondary`, `--accent` (+ foregrounds, ring) with the branding store's
 * hex values. Also loads the selected Bunny Font via `useHead()`.
 *
 * Bind on any container to scope branding to that subtree.
 * Call `provide(BRANDING_STYLE_KEY, brandingStyle)` in donor-facing components
 * so their teleported modals inherit branding via `useInjectedBrandingStyle()`.
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

  // Load font stylesheet
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
