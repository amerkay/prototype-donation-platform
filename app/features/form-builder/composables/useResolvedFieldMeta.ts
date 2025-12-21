import { computed, inject, type ComputedRef } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'

type FormValues = Record<string, unknown>

type ResolvableText = string | ((values: FormValues) => string)

type WithResolvableText = Pick<BaseFieldMeta, 'label' | 'description' | 'placeholder'>

function resolveText(text: ResolvableText | undefined, values: FormValues): string | undefined {
  if (!text) return undefined
  return typeof text === 'function' ? text(values) : text
}

/**
 * Composable to resolve dynamic field metadata (label, description, placeholder)
 * Now accepts ComputedRef<FormValues> for proper reactivity
 */
export function useResolvedFieldMeta(
  meta: WithResolvableText,
  formValues?: ComputedRef<FormValues>
) {
  const injectedFormValues = inject<ComputedRef<FormValues>>(
    'formValues',
    computed(() => ({}))
  )
  const values = formValues || injectedFormValues

  const resolvedLabel = computed(() => resolveText(meta.label, values.value))
  const resolvedDescription = computed(() => resolveText(meta.description, values.value))
  const resolvedPlaceholder = computed(() => resolveText(meta.placeholder, values.value))

  return {
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder
  }
}
