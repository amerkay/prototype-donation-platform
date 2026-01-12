/**
 * Custom fields configuration types (V3 - Factory-Based)
 * Allows admins to add extra form fields to forms
 *
 * Uses field-specific factory modules for type-specific configs.
 * Each field type (text, slider, select, etc.) has its own factory with:
 * - Admin config generator (createAdminConfig)
 * - Runtime field converter (toComposable)
 * - Default value extractor (getDefaultValue)
 */

import type { ConditionGroup } from '~/features/form-builder/conditions'

/**
 * Base configuration shared by all custom fields
 */
export interface BaseFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: unknown
  /** Nested advanced settings from admin form (contains field-specific config) */
  advancedSettings?: Record<string, unknown>
  /** Whether visibility conditions are enabled for this field */
  enableVisibilityConditions?: boolean
  /** Visibility condition configuration */
  visibilityConditions?: {
    visibleWhen?: ConditionGroup
  }
}

/**
 * Text field configuration (admin-editable)
 */
export interface TextFieldConfig extends BaseFieldConfig {
  placeholder?: string
  maxLength?: number
}

/**
 * Textarea field configuration (admin-editable)
 */
export interface TextareaFieldConfig extends BaseFieldConfig {
  placeholder?: string
  rows?: number
  maxLength?: number
}

/**
 * Number field configuration (admin-editable)
 */
export interface NumberFieldConfig extends Omit<BaseFieldConfig, 'defaultValue'> {
  defaultValue?: number
  min?: number
  max?: number
  step?: number
}

/**
 * Slider field configuration (admin-editable)
 */
export interface SliderFieldConfig extends Omit<BaseFieldConfig, 'defaultValue'> {
  defaultValue?: number
  min: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
}

/**
 * Select field configuration (admin-editable)
 */
export interface SelectFieldConfig extends BaseFieldConfig {
  placeholder?: string
  options: string[] // Array of option labels (values auto-generated)
}

/**
 * Radio group field configuration (admin-editable)
 */
export interface RadioGroupFieldConfig extends BaseFieldConfig {
  options: string[] // Array of option labels (values auto-generated)
  orientation?: 'vertical' | 'horizontal'
}

/**
 * Checkbox field configuration (admin-editable)
 */
export interface CheckboxFieldConfig extends Omit<BaseFieldConfig, 'defaultValue'> {
  defaultValue?: boolean | string[]
  options?: string[] // If provided, renders checkbox array; otherwise single checkbox
}

/**
 * Hidden field configuration (admin-editable)
 */
export interface HiddenFieldConfig extends Omit<BaseFieldConfig, 'defaultValue'> {
  defaultValue: string // Required for hidden fields
}

// Re-export CustomFieldType from fields
export type { CustomFieldType } from './fields'

/**
 * Single custom field definition (V3 - Factory-Based)
 * Structure matches the factory config types with base properties from BaseFieldConfig
 */
export type CustomFieldDefinition =
  | ({ type: 'text' } & TextFieldConfig)
  | ({ type: 'textarea' } & TextareaFieldConfig)
  | ({ type: 'slider' } & SliderFieldConfig)
  | ({ type: 'select' } & SelectFieldConfig)
  | ({ type: 'hidden' } & HiddenFieldConfig)
  | ({ type: 'checkbox' } & CheckboxFieldConfig)
  | ({ type: 'number' } & NumberFieldConfig)
  | ({ type: 'radio-group' } & RadioGroupFieldConfig)

/**
 * Custom fields settings (stored in formConfig)
 */
export interface CustomFieldsSettings {
  enabled: boolean
  fields: CustomFieldDefinition[]
}
