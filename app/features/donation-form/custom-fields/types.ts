/**
 * Custom fields configuration types
 * Allows admins to add extra form fields to step 3
 */

/**
 * Single custom field definition
 */
export interface CustomFieldDefinition {
  // Field identification
  id: string
  type: 'text' | 'textarea' | 'slider' | 'select' | 'hidden'

  // Common properties (all field types)
  label: string

  // Unified field configuration (adapts to field type)
  fieldConfig?: {
    // Common across multiple types
    optional?: boolean // Defaults to true
    placeholder?: string // text, textarea, select
    defaultValue?: unknown // text, textarea, slider, hidden
    maxLength?: number // text, textarea

    // Textarea-specific
    rows?: number

    // Slider-specific
    min?: number
    max?: number
    step?: number
    prefix?: string
    suffix?: string

    // Select-specific
    options?: string[] // Array of option labels (values auto-generated)
  }
}

/**
 * Custom fields settings (stored in formConfig)
 */
export interface CustomFieldsSettings {
  enabled: boolean
  fields: CustomFieldDefinition[]
}
