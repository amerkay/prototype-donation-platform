import { inject, computed, type ComputedRef } from 'vue'

type FormValues = Record<string, unknown>

/**
 * Composable to inject common form builder context values
 * Reduces boilerplate in field components that need access to form state
 *
 * @returns Object with all injected context values
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix, formValues, parentGroupVisible } = useFormBuilderContext()
 * ```
 */
export function useFormBuilderContext() {
  const sectionId = inject<string>('sectionId', '')
  const fieldPrefix = inject<string>('fieldPrefix', '')
  const formValues = inject<ComputedRef<FormValues>>(
    'formValues',
    computed(() => ({}))
  )
  const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

  return {
    sectionId,
    fieldPrefix,
    formValues,
    parentGroupVisible
  }
}
