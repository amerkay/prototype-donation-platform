import { computed, inject } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'

type FormValues = Record<string, unknown>

type ResolvableText = string | ((values: FormValues) => string)

type WithResolvableText = Pick<BaseFieldMeta, 'label' | 'description' | 'placeholder'>

function resolveText(text: ResolvableText | undefined, values: FormValues): string | undefined {
  if (!text) return undefined
  return typeof text === 'function' ? text(values) : text
}

export function useResolvedFieldMeta(meta: WithResolvableText, getFormValues?: () => FormValues) {
  const formValues = getFormValues ?? inject<() => FormValues>('formValues', () => ({}))

  const resolvedLabel = computed(() => resolveText(meta.label, formValues()))
  const resolvedDescription = computed(() => resolveText(meta.description, formValues()))
  const resolvedPlaceholder = computed(() => resolveText(meta.placeholder, formValues()))

  return {
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder
  }
}
