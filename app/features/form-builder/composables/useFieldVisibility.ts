import { computed } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from './useFormBuilderContext'

/**
 * Composable to compute field visibility based on parent visibility and visibleWhen condition
 * Uses vee-validate's form values via useFormBuilderContext for reactivity
 *
 * @param meta - Field metadata containing optional visibleWhen condition
 * @param parentGroupVisible - Function to check if parent container is visible
 * @returns Computed boolean indicating if field should be visible
 *
 * @example
 * ```ts
 * const { parentGroupVisible } = useFormBuilderContext()
 * const isVisible = useFieldVisibility(props.meta, parentGroupVisible)
 * ```
 */
export function useFieldVisibility(
  meta: Pick<BaseFieldMeta, 'visibleWhen'>,
  parentGroupVisible: () => boolean
) {
  const { formValues } = useFormBuilderContext()

  return computed(() => {
    // First check if parent is visible
    if (!parentGroupVisible()) return false

    // Then check this field's own visibility condition
    if (!meta.visibleWhen) return true
    return meta.visibleWhen(formValues.value)
  })
}
