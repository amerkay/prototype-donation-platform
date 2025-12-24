import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import type { BaseFieldMeta } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from './useResolvedFieldMeta'

type WrapperOptions = {
  orientation?: 'horizontal' | 'vertical'
  disableLabelFor?: boolean
  variant?: 'field' | 'fieldset'
}

/**
 * Composable to generate standardized props for FormFieldWrapper/FormFieldSetWrapper
 * Eliminates repetitive prop passing in all field components
 *
 * @param meta - Field metadata
 * @param name - Field name
 * @param errors - Validation errors array (can be reactive ref/computed)
 * @param options - Additional wrapper options including variant type
 * @returns Object with all wrapper props ready to spread
 *
 * @example
 * ```ts
 * // For standard fields
 * const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)
 *
 * // For fieldset-based fields (RadioGroup)
 * const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors, { variant: 'fieldset' })
 * ```
 */
export function useFieldWrapper(
  meta: Pick<
    BaseFieldMeta,
    'label' | 'description' | 'placeholder' | 'optional' | 'labelClass' | 'descriptionClass'
  >,
  name: string,
  errors: MaybeRefOrGetter<string[]>,
  options: WrapperOptions = {}
) {
  const { resolvedLabel, resolvedDescription, resolvedPlaceholder } = useResolvedFieldMeta(meta)
  const isFieldset = options.variant === 'fieldset'

  const wrapperProps = computed(() => {
    const errorsArray = toValue(errors)
    const baseProps = {
      [isFieldset ? 'legend' : 'label']: resolvedLabel.value,
      description: resolvedDescription.value,
      optional: meta.optional,
      errors: errorsArray,
      invalid: errorsArray.length > 0,
      [isFieldset ? 'legendClass' : 'labelClass']: meta.labelClass,
      descriptionClass: meta.descriptionClass
    }

    // Add field-specific props only for non-fieldset variant
    if (!isFieldset) {
      return {
        ...baseProps,
        name,
        orientation: options.orientation,
        disableLabelFor: options.disableLabelFor
      }
    }

    return baseProps
  })

  return {
    wrapperProps,
    resolvedLabel,
    resolvedDescription,
    resolvedPlaceholder
  }
}

/**
 * Utility to prevent form submission on Enter key in text inputs
 * Shared across Text, Number, Currency fields
 */
export function preventEnterSubmit(event: KeyboardEvent) {
  event.preventDefault()
}
