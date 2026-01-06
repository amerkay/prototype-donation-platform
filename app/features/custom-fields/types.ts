/**
 * Custom fields configuration types (V3 - Factory-Based)
 * Allows admins to add extra form fields to step 3
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

/**
 * Custom fields settings for donation form with step-based tabs
 * Used in donation form config to separate Step 2 and Step 3 custom fields
 */
export interface DonationCustomFieldsSettings {
  customFieldsTabs: {
    step2: {
      enabled: boolean
      fields: CustomFieldDefinition[]
    }
    step3: {
      enabled: boolean
      fields: CustomFieldDefinition[]
    }
  }
}
