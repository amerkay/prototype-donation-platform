import { computed } from 'vue'
import type { BaseFieldMeta, FieldContext } from '~/features/form-builder/types'
import { useFormBuilderContext } from './useFormBuilderContext'

type ResolvableText = string | ((ctx: FieldContext) => string)

type WithResolvableText = Pick<BaseFieldMeta, 'label' | 'description' | 'placeholder'>

/**
 * Utility to resolve text that can be static string or dynamic function
 * Exported for reuse in other components (e.g., tab labels, badges)
 */
export function resolveText(
  text: ResolvableText | undefined,
  ctx: FieldContext
): string | undefined {
  if (!text) return undefined
  return typeof text === 'function' ? text(ctx) : text
}

/**
 * Composable to resolve dynamic field metadata (label, description, placeholder)
 * Uses vee-validate's form values AND external context via useFormBuilderContext for reactivity
 */
export function useResolvedFieldMeta(meta: WithResolvableText) {
  const { fieldContext } = useFormBuilderContext()

  const resolvedLabel = computed(() => resolveText(meta.label, fieldContext.value))
  const resolvedDescription = computed(() => resolveText(meta.description, fieldContext.value))
  const resolvedPlaceholder = computed(() => resolveText(meta.placeholder, fieldContext.value))

  return {
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder
  }
}
