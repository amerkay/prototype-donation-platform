import { inject, computed, type ComputedRef } from 'vue'
import { useFormValues } from 'vee-validate'
import type { FieldContext, SetFieldValueFn } from '~/features/_library/form-builder/types'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'

type FormValues = Record<string, unknown>
type SetFieldErrorFn = (field: string, message: string | string[] | undefined) => void
type SetFieldTouchedFn = (field: string, touched: boolean) => void

/**
 * Composable to access form builder context and values using vee-validate's composition API
 * Automatically unwraps section-prefixed values and handles scoped container overrides
 * Merges external context values for conditional visibility and dynamic options
 * Provides form action setters (setFieldValue, setFieldError, setFieldTouched) and context schema
 *
 * @returns Object with all context values, unwrapped form values, and form action setters
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix, formValues, fieldContext, setFieldValue } = useFormBuilderContext()
 * ```
 */
export function useFormBuilderContext() {
  const sectionId = inject<string>('sectionId', '')
  const fieldPrefix = inject<string>('fieldPrefix', '')
  const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)
  const parentGroupDisabled = inject<() => boolean>('parentGroupDisabled', () => false)
  const validateOnMount = inject<boolean>('validateOnMount', true)

  // Inject form action setters from FormRenderer
  const setFieldValue = inject<SetFieldValueFn>('setFieldValue', () => {})
  const setFieldError = inject<SetFieldErrorFn>('setFieldError', () => {})
  const setFieldTouched = inject<SetFieldTouchedFn>('setFieldTouched', () => {})

  // Inject external context provided by FormRenderer (now a computed ref for reactivity)
  const externalContextRef = inject<ComputedRef<Record<string, unknown>>>(
    'externalContext',
    computed(() => ({}))
  )

  // Inject context schema for condition builder
  const contextSchema = inject<ComputedRef<ContextSchema>>(
    'contextSchema',
    computed(() => ({}))
  )

  // Get form values from vee-validate
  const veeFormValues = useFormValues<Record<string, FormValues>>()

  // Check if we have scoped FieldContext from a container (field-group/tabs)
  // Containers can optionally provide scoped context with values, parent, and root
  const scopedFieldContext = inject<ComputedRef<FieldContext> | null>('scopedFormValues', null)

  // Unwrap section-prefixed values or use scoped override
  const formValues = computed(() => {
    // Prefer scoped values if provided (from field-group/tabs)
    if (scopedFieldContext) {
      return scopedFieldContext.value.values || {}
    }

    // Otherwise unwrap from section ID
    const sectionValues = veeFormValues.value[sectionId]
    return (sectionValues as FormValues) || {}
  })

  // Provide full FieldContext for dynamic functions
  // Merges external context with form values for condition evaluation
  const fieldContext = computed<FieldContext>(() => {
    // Get current external context value
    const externalContext = externalContextRef.value

    if (scopedFieldContext) {
      // Ensure all properties are objects and merge external context
      const ctx = scopedFieldContext.value
      return {
        values: { ...(ctx.values || {}), ...externalContext },
        parent: ctx.parent || undefined,
        root: { ...(ctx.root || {}), ...externalContext },
        form: ctx.values || {} // Pure form values without context
      }
    }

    return {
      values: { ...(formValues.value || {}), ...externalContext },
      root: { ...(formValues.value || {}), ...externalContext },
      form: formValues.value || {} // Pure form values without context
    }
  })

  return {
    sectionId,
    fieldPrefix,
    formValues,
    fieldContext,
    parentGroupVisible,
    parentGroupDisabled,
    validateOnMount,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    contextSchema
  }
}
