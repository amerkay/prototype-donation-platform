import { ref, watch, nextTick, type Ref } from 'vue'
import { activateHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

interface PreviewSyncOptions {
  /** Ref tracking the currently open accordion ID (from provideAccordionGroup) */
  accordionId: Ref<string | undefined>
  /** Map of accordion ID → preview tab value */
  mapping: Record<string, string>
  /** Default preview tab */
  defaultTab: string
}

/**
 * Bidirectional sync between form accordion sections and preview pane tabs.
 *
 * Watches the accordion state ref and maps it to a preview tab. When the preview
 * tab is changed via `syncToAccordion`, it sets the accordion state and scrolls
 * the form to the matching section.
 */
export function usePreviewSync({ accordionId, mapping, defaultTab }: PreviewSyncOptions) {
  const activePreviewTab = ref(defaultTab)

  // Reverse mapping: preview tab → accordion ID
  const tabToAccordion = Object.fromEntries(Object.entries(mapping).map(([k, v]) => [v, k]))

  let suppressing = false

  // Accordion open → switch preview tab
  watch(accordionId, (id) => {
    if (suppressing) return
    if (id && mapping[id]) {
      activePreviewTab.value = mapping[id]
    }
  })

  // Preview tab click → open corresponding accordion + scroll
  function syncToAccordion(tab: string | number) {
    activePreviewTab.value = String(tab)
    const target = tabToAccordion[tab]
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
