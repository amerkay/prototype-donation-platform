import { computed, toValue, unref, type MaybeRefOrGetter, type ComputedRef } from 'vue'
import type { FieldContext } from '~/features/_library/form-builder/types'
import { useResolvedFieldMeta } from './useResolvedFieldMeta'
import { useFormBuilderContext } from './useFormBuilderContext'

type WrapperOptions = {
  orientation?: 'horizontal' | 'vertical'
  disableLabelFor?: boolean
  variant?: 'field' | 'fieldset'
}

/**
 * Extended type that supports both old BaseFieldMeta and new BaseFieldConfig with ComputedRef
 */
type FieldMetaLike = {
  label?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  description?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  placeholder?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
  optional?: boolean
  disabled?: boolean | ComputedRef<boolean> | ((ctx: FieldContext) => boolean)
  labelClass?: string
  descriptionClass?: string
  class?: string | ComputedRef<string> | ((ctx: FieldContext) => string)
}

/**
 * Composable to generate standardized props for FormFieldWrapper/FormFieldSetWrapper
 * Eliminates repetitive prop passing in all field components
 *
 * @param meta - Field metadata
 * @param name - Field name
 * @param errors - Validation errors array (can be reactive ref/computed)
 * @param options - Additional wrapper options including variant type
 * @param fullPath - Optional full vee-validate path for hash target highlighting
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
  meta: FieldMetaLike,
  name: string,
  errors: MaybeRefOrGetter<string[]>,
  options: WrapperOptions = {},
  fullPath?: MaybeRefOrGetter<string | undefined>
) {
  const { fieldContext, parentGroupDisabled } = useFormBuilderContext()
  const { resolvedLabel, resolvedDescription, resolvedPlaceholder, resolvedClass } =
    useResolvedFieldMeta(meta)
  const isFieldset = options.variant === 'fieldset'

  const resolvedDisabled = computed(() => {
    if (parentGroupDisabled()) return true
    if (!meta.disabled) return false
    // Check if it's a ComputedRef
    if (typeof meta.disabled === 'object' && 'value' in meta.disabled) {
      return unref(meta.disabled)
    }
    if (typeof meta.disabled === 'function') {
      return meta.disabled(fieldContext.value)
    }
    return meta.disabled
  })

  const wrapperProps = computed(() => {
    const errorsArray = toValue(errors)
    const baseProps = {
      label: resolvedLabel.value,
      description: resolvedDescription.value,
      optional: meta.optional,
      errors: errorsArray,
      invalid: errorsArray.length > 0,
      labelClass: meta.labelClass,
      descriptionClass: meta.descriptionClass,
      fullPath: fullPath ? toValue(fullPath) : undefined
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
    resolvedPlaceholder,
    resolvedDisabled,
    resolvedClass
  }
}

/**
 * Utility to prevent form submission on Enter key in text inputs
 * Shared across Text, Number, Currency fields
 */
export function preventEnterSubmit(event: KeyboardEvent) {
  event.preventDefault()
}
