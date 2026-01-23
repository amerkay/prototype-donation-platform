import { inject, provide, ref, computed, type Ref } from 'vue'

/**
 * Shared accordion group state for managing single-open behavior across sibling accordions
 * Used by FormFieldArray and field-groups to ensure only one collapsible item is open at a time
 *
 * @example
 * ```ts
 * // In parent (array/container):
 * const { provideAccordionGroup } = useAccordionGroup()
 * provideAccordionGroup()
 *
 * // In child (field-group):
 * const { registerAccordion } = useAccordionGroup()
 * const accordionValue = registerAccordion('my-field-name', defaultOpen)
 * // accordionValue is a ref for v-model binding
 * ```
 */
export function useAccordionGroup() {
  // Try to inject shared state (or null if no parent provided it)
  const sharedState = inject<Ref<string | undefined> | null>('accordionGroupState', null)

  /**
   * Provide accordion group context for children
   * Call this in parent containers (FormFieldArray, nested field-groups, etc.)
   */
  function provideAccordionGroup() {
    const groupState = ref<string | undefined>(undefined)
    provide('accordionGroupState', groupState)
  }

  /**
   * Register an accordion with the group and get its reactive state
   * Returns a computed ref that syncs with group state
   *
   * @param accordionId - Unique identifier for this accordion (typically field name)
   * @param defaultOpen - Whether this accordion should be open initially
   * @returns Ref<string | undefined> - Accordion value for v-model binding
   */
  function registerAccordion(accordionId: string, defaultOpen: boolean): Ref<string | undefined> {
    // If no shared state, return standalone ref
    if (!sharedState) {
      return ref<string | undefined>(defaultOpen ? accordionId : undefined)
    }

    // Initialize group state if this accordion should be open by default
    if (defaultOpen && sharedState.value === undefined) {
      sharedState.value = accordionId
    }

    // Return a computed ref that maps group state to this accordion's v-model format
    return computed({
      get: () => (sharedState.value === accordionId ? accordionId : undefined),
      set: (newValue: string | undefined) => {
        // When v-model updates, sync to group state
        sharedState.value = newValue
      }
    })
  }

  /**
   * Check if accordion group context is available
   * @returns true if parent provided accordion group state
   */
  function hasAccordionGroup(): boolean {
    return sharedState !== null
  }

  return {
    provideAccordionGroup,
    registerAccordion,
    hasAccordionGroup
  }
}
