import { computed, type ComputedRef } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'

type FormValues = Record<string, unknown>

/**
 * Composable to compute field visibility based on parent visibility and visibleWhen condition
 *
 * @param meta - Field metadata containing optional visibleWhen condition
 * @param formValues - Computed form values for evaluating visibility conditions
 * @param parentGroupVisible - Function to check if parent container is visible
 * @returns Computed boolean indicating if field should be visible
 *
 * @example
 * ```ts
 * const { formValues, parentGroupVisible } = useFormBuilderContext()
 * const isVisible = useFieldVisibility(props.meta, formValues, parentGroupVisible)
 * ```
 */
export function useFieldVisibility(
  meta: Pick<BaseFieldMeta, 'visibleWhen'>,
  formValues: ComputedRef<FormValues>,
  parentGroupVisible: () => boolean
) {
  return computed(() => {
    // First check if parent is visible
    if (!parentGroupVisible()) return false

    // Then check this field's own visibility condition
    if (!meta.visibleWhen) return true
    return meta.visibleWhen(formValues.value)
  })
}
