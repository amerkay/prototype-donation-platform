/**
 * Custom fields configuration types (V3 - Factory-Based)
 * Allows admins to add extra form fields to forms
 *
 * Uses field-specific factory modules for type-specific configs.
 * Each field type (text, slider, select, etc.) has its own factory with:
 * - Admin config generator (createAdminConfig)
 * - Runtime field converter (toFieldMeta)
 * - Default value extractor (getDefaultValue)
 */

// Re-export field type configs from factories
export type {
  TextFieldConfig,
  TextareaFieldConfig,
  SliderFieldConfig,
  SelectFieldConfig,
  HiddenFieldConfig,
  CheckboxFieldConfig,
  NumberFieldConfig,
  RadioGroupFieldConfig,
  CustomFieldType
} from './fields'

/**
 * Single custom field definition (V3 - Factory-Based)
 * Structure matches the factory config types
 */
export type CustomFieldDefinition =
  | ({ type: 'text' } & import('./fields').TextFieldConfig)
  | ({ type: 'textarea' } & import('./fields').TextareaFieldConfig)
  | ({ type: 'slider' } & import('./fields').SliderFieldConfig)
  | ({ type: 'select' } & import('./fields').SelectFieldConfig)
  | ({ type: 'hidden' } & import('./fields').HiddenFieldConfig)
  | ({ type: 'checkbox' } & import('./fields').CheckboxFieldConfig)
  | ({ type: 'number' } & import('./fields').NumberFieldConfig)
  | ({ type: 'radio-group' } & import('./fields').RadioGroupFieldConfig)

/**
 * Custom fields settings (stored in formConfig)
 */
export interface CustomFieldsSettings {
  enabled: boolean
  fields: CustomFieldDefinition[]
}
