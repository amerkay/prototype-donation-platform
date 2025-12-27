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
  type: 'text' | 'textarea' | 'slider' | 'select'

  // Common properties (all field types)
  label: string
  placeholder?: string
  optional?: boolean
  hidden?: boolean // For hidden tracking fields

  // Type-specific configs (nested in form, but we support both for backward compatibility)
  textConfig?: {
    maxLength?: number
  }
  textareaConfig?: {
    rows?: number
    maxLength?: number
  }
  sliderConfig?: {
    min?: number
    max?: number
    step?: number
    prefix?: string
    suffix?: string
  }
  selectConfig?: {
    options?: Array<{ value: string; label: string }>
  }

  // Legacy top-level properties (for backward compatibility)
  maxLength?: number
  rows?: number
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  options?: Array<{ value: string; label: string }>
}

/**
 * Custom fields settings (stored in formConfig)
 */
export interface CustomFieldsSettings {
  enabled: boolean
  fields: CustomFieldDefinition[]
}
