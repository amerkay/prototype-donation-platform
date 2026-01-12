/**
 * Field Factories - Barrel Export
 * Single import point for all custom field factories
 */

import { textField } from './text-field'
import { textareaField } from './textarea-field'
import { sliderField } from './slider-field'
import { selectField } from './select-field'
import { hiddenField } from './hidden-field'
import { checkboxField } from './checkbox-field'
import { numberField } from './number-field'
import { radioGroupField } from './radio-group-field'

// Re-export types from types.ts
export type {
  TextFieldConfig,
  TextareaFieldConfig,
  SliderFieldConfig,
  SelectFieldConfig,
  HiddenFieldConfig,
  CheckboxFieldConfig,
  NumberFieldConfig,
  RadioGroupFieldConfig,
  BaseFieldConfig
} from '../types'
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
