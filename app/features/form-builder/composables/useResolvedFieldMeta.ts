import { computed } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from './useFormBuilderContext'

type FormValues = Record<string, unknown>

type ResolvableText = string | ((values: FormValues) => string)

type WithResolvableText = Pick<BaseFieldMeta, 'label' | 'description' | 'placeholder'>

/**
 * Utility to resolve text that can be static string or dynamic function
 * Exported for reuse in other components (e.g., tab labels, badges)
 */
export function resolveText(
  text: ResolvableText | undefined,
  values: FormValues
): string | undefined {
  if (!text) return undefined
  return typeof text === 'function' ? text(values) : text
}

/**
 * Composable to resolve dynamic field metadata (label, description, placeholder)
 * Uses vee-validate's form values via useFormBuilderContext for reactivity
 */
export function useResolvedFieldMeta(meta: WithResolvableText) {
  const { formValues } = useFormBuilderContext()

  const resolvedLabel = computed(() => resolveText(meta.label, formValues.value))
  const resolvedDescription = computed(() => resolveText(meta.description, formValues.value))
  const resolvedPlaceholder = computed(() => resolveText(meta.placeholder, formValues.value))

  return {
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder
  }
}
