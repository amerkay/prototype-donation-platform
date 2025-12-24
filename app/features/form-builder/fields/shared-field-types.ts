/**
 * Shared type definitions for form field components
 * Eliminates repetitive Props and Emits across 11+ field components
 */

/**
 * Standard props for all value-based form field components
 * Used by: Text, Textarea, Number, Currency, Toggle, Select, Combobox, Autocomplete, RadioGroup, Emoji, Slider
 */
export interface BaseFieldProps<TValue = unknown, TMeta = unknown> {
  modelValue?: TValue
  errors: string[]
  meta: TMeta
  name: string
  onBlur?: (e?: Event) => void
  class?: string
}

/**
 * Standard emits for all form field components with v-model support
 */
export interface BaseFieldEmits<TValue = unknown> {
  'update:modelValue': [value: TValue]
}

/**
 * Helper type to infer proper Props type with meta constraint
 */
export type FieldProps<TValue, TMeta> = BaseFieldProps<TValue, TMeta>

/**
 * Helper type for emit definitions
 */
export type FieldEmits<TValue> = BaseFieldEmits<TValue>
