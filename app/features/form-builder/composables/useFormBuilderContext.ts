import { inject, computed, type ComputedRef } from 'vue'
import { useFormValues } from 'vee-validate'
import type { FieldContext } from '~/features/form-builder/types'

type FormValues = Record<string, unknown>

/**
 * Composable to access form builder context and values using vee-validate's composition API
 * Automatically unwraps section-prefixed values and handles scoped container overrides
 * Merges external context values for conditional visibility and dynamic options
 *
 * @returns Object with all context values and unwrapped form values
 *
 * @example
 * ```ts
 * const { sectionId, fieldPrefix, formValues, fieldContext, parentGroupVisible } = useFormBuilderContext()
 * ```
 */
export function useFormBuilderContext() {
  const sectionId = inject<string>('sectionId', '')
  const fieldPrefix = inject<string>('fieldPrefix', '')
  const parentGroupVisible = inject<() => boolean>('parentGroupVisible', () => true)

  // Inject external context provided by FormRenderer
  const externalContext = inject<Record<string, unknown>>('externalContext', {})

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
    parentGroupVisible
  }
}
