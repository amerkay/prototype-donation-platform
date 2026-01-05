/**
 * Hidden Field Factory
 * Invisible tracking field for analytics/UTM parameters
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'

/**
 * Hidden field configuration (admin-editable)
 */
export interface HiddenFieldConfig {
  id: string
  label: string
  defaultValue: string // Required for hidden fields
}

/**
 * Create admin configuration fields for hidden field
 */
export function createHiddenFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    defaultValue: {
      type: 'text',
      label: 'Hidden Value',
      placeholder: 'Value to track (e.g., utm_source)',
      description: 'This value will be submitted with the form but not shown to users',
      rules: z.string().min(1, 'Hidden value is required')
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function hiddenFieldToFieldMeta(config: HiddenFieldConfig): FieldMeta {
  return {
    type: 'text' as const,
    label: config.label,
    defaultValue: config.defaultValue,
    visibleWhen: () => false,
    rules: z.string().optional()
  }
}

/**
 * Extract default value from hidden field config
 */
export function getHiddenFieldDefaultValue(config: HiddenFieldConfig): string {
  return config.defaultValue
}

/**
 * Complete hidden field factory export
 */
export const hiddenField = {
  createAdminConfig: createHiddenFieldAdminConfig,
  toFieldMeta: hiddenFieldToFieldMeta,
  getDefaultValue: getHiddenFieldDefaultValue
}
