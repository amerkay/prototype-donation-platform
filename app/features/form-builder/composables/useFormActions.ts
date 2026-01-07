import { inject } from 'vue'

/**
 * Form action setters injected by FormRenderer
 * Centralized injection point for form manipulation functions
 */
export interface FormActions {
  setFieldError: (field: string, message: string | string[] | undefined) => void
  setFieldTouched: (field: string, touched: boolean) => void
  setFieldValue: (field: string, value: unknown) => void
}

/**
 * Composable to access form action setters (setFieldError, setFieldTouched, setFieldValue)
 * Reduces repeated inject() calls across all composables
 *
 * @returns Form action functions or null if not in form context
 *
 * @example
 * ```ts
 * const formActions = useFormActions()
 * if (formActions) {
 *   formActions.setFieldError('field', 'Error message')
 *   formActions.setFieldTouched('field', true)
 * }
 * ```
 */
export function useFormActions(): FormActions | null {
  const setFieldError = inject<FormActions['setFieldError'] | null>('setFieldError', null)
  const setFieldTouched = inject<FormActions['setFieldTouched'] | null>('setFieldTouched', null)
  const setFieldValue = inject<FormActions['setFieldValue'] | null>('setFieldValue', null)

  // Only return if all setters are available
  if (!setFieldError || !setFieldTouched || !setFieldValue) {
    return null
  }

  return {
    setFieldError,
    setFieldTouched,
    setFieldValue
  }
}
