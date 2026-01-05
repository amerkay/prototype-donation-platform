/**
 * Field Factories - Barrel Export
 * Single import point for all custom field factories
 */

import { textField, type TextFieldConfig } from './text-field'
import { textareaField, type TextareaFieldConfig } from './textarea-field'
import { sliderField, type SliderFieldConfig } from './slider-field'
import { selectField, type SelectFieldConfig } from './select-field'
import { hiddenField, type HiddenFieldConfig } from './hidden-field'
import { checkboxField, type CheckboxFieldConfig } from './checkbox-field'
import { numberField, type NumberFieldConfig } from './number-field'
import { radioGroupField, type RadioGroupFieldConfig } from './radio-group-field'

// Re-export types
export type {
  TextFieldConfig,
  TextareaFieldConfig,
  SliderFieldConfig,
  SelectFieldConfig,
  HiddenFieldConfig,
  CheckboxFieldConfig,
  NumberFieldConfig,
  RadioGroupFieldConfig
}
export * from './field-base'

/**
 * Field type to factory mapping
 * Makes it easy to get the right factory for a given type
 */
export const FIELD_FACTORIES = {
  text: textField,
  textarea: textareaField,
  slider: sliderField,
  select: selectField,
  hidden: hiddenField,
  checkbox: checkboxField,
  number: numberField,
  'radio-group': radioGroupField
} as const

export type CustomFieldType = keyof typeof FIELD_FACTORIES
