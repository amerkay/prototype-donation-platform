import type { VeeFieldContext } from '~/features/form-builder/form-builder-types'

type FieldOnChange = (value: unknown) => void

type OnFieldChange = (value: unknown, fieldOnChange: FieldOnChange) => void

export function useFieldChange(field: VeeFieldContext, onFieldChange?: OnFieldChange) {
  const handleChange = (value: unknown) => {
    if (onFieldChange) {
      onFieldChange(value, field.onChange)
      return
    }

    field.onChange(value)
  }

  return {
    handleChange
  }
}
