import { ref, watch, nextTick, type Ref } from 'vue'
import {
  activateHashTarget,
  lastActivatedTarget
} from '~/features/_library/form-builder/composables/useHashTarget'

interface PreviewSyncBaseOptions {
  /** Map of form path → preview tab value */
  mapping: Record<string, string>
  /** Default preview tab */
  defaultTab: string
}

interface AccordionSyncOptions extends PreviewSyncBaseOptions {
  /** Ref tracking the currently open accordion ID (from provideAccordionGroup) */
  accordionId: Ref<string | undefined>
}

interface HashTargetSyncOptions extends PreviewSyncBaseOptions {
  /** Use lastActivatedTarget for sync instead of accordion state */
  useHashTarget: true
}

type PreviewSyncOptions = AccordionSyncOptions | HashTargetSyncOptions

/**
 * Bidirectional sync between form sections and preview pane tabs.
 *
 * Supports two modes:
 * - `accordionId` mode: watches an accordion state ref (legacy, for collapsible groups)
 * - `useHashTarget` mode: watches lastActivatedTarget (for tabbed forms)
 *
 * When the preview tab is changed via `syncToAccordion`, it activates the
 * corresponding hash target to scroll the form to the matching section.
 */
export function usePreviewSync(options: PreviewSyncOptions) {
  const { mapping, defaultTab } = options
  const activePreviewTab = ref(defaultTab)

  // Reverse mapping: preview tab → form path
  const tabToFormPath = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]))

  let suppressing = false

  if ('accordionId' in options) {
    // Legacy accordion mode
    const { accordionId } = options

    watch(accordionId, (id) => {
      if (suppressing) return
      if (id && mapping[id]) {
        activePreviewTab.value = mapping[id]
      }
    })

    function syncToAccordion(tab: string | number) {
      activePreviewTab.value = String(tab)
      const target = tabToFormPath[tab]
      if (!target) return

      suppressing = true
      accordionId.value = target
      nextTick(() => {
        activateHashTarget(target)
        suppressing = false
      })
    }

    return { activePreviewTab, syncToAccordion }
  }

  // Hash target mode: watch lastActivatedTarget for form → preview sync
  watch(lastActivatedTarget, (activated) => {
    if (suppressing || !activated) return
    // Find the longest matching mapping key
    const match = Object.keys(mapping)
      .filter(
        (p) =>
          activated.target === p ||
          activated.target.startsWith(`${p}.`) ||
          activated.target.endsWith(`.${p}`) ||
          activated.target.includes(`.${p}.`)
      )
      .sort((a, b) => b.length - a.length)[0]
    if (match && mapping[match]) {
      activePreviewTab.value = mapping[match]
    }
  })

  function syncToAccordion(tab: string | number) {
    activePreviewTab.value = String(tab)
    const target = tabToFormPath[tab]
    if (!target) return

    suppressing = true
    nextTick(() => {
      activateHashTarget(target)
      suppressing = false
    })
  }

  return { activePreviewTab, syncToAccordion }
}
