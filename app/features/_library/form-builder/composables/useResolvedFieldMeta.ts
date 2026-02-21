import { computed, unref } from 'vue'
import type { ComputedRef } from 'vue'
import type { FieldContext } from '~/features/_library/form-builder/types'
import { useFormBuilderContext } from './useFormBuilderContext'

export type ResolvableText = string | ((ctx: FieldContext) => string) | ComputedRef<string>

export type WithResolvableText = {
  label?: ResolvableText
  description?: ResolvableText
  placeholder?: ResolvableText
  helpText?: ResolvableText
  class?: ResolvableText
}

/**
 * Utility to resolve text that can be static string or dynamic function or ComputedRef
 * Exported for reuse in other components (e.g., tab labels, badges)
 */
export function resolveText(
  text: ResolvableText | undefined,
  ctx: FieldContext
): string | undefined {
  if (!text) return undefined
  if (typeof text === 'object' && 'value' in text) {
    // It's a ComputedRef
    return unref(text)
  }
  return typeof text === 'function' ? text(ctx) : text
}

/**
 * Composable to resolve dynamic field metadata (label, description, placeholder, class)
 * Uses vee-validate's form values AND external context via useFormBuilderContext for reactivity
 */
export function useResolvedFieldMeta(meta: WithResolvableText) {
  const { fieldContext } = useFormBuilderContext()

  const resolvedLabel = computed(() => resolveText(meta.label, fieldContext.value))
  const resolvedDescription = computed(() => resolveText(meta.description, fieldContext.value))
  const resolvedPlaceholder = computed(() => resolveText(meta.placeholder, fieldContext.value))
  const resolvedHelpText = computed(() => resolveText(meta.helpText, fieldContext.value))
  const resolvedClass = computed(() => resolveText(meta.class, fieldContext.value))

  return {
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder,
    resolvedHelpText,
    resolvedClass
  }
}
