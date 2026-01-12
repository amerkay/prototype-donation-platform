/**
 * Hidden Field Factory
 * Invisible tracking field for analytics/UTM parameters
 */
import * as z from 'zod'
import type { HiddenFieldConfig } from '../types'
import { textField, hiddenField as hiddenFieldComposable } from '~/features/form-builder/api'
import type { FieldDef } from '~/features/form-builder/types'

/**
 * Create admin configuration fields for hidden field
 */
export function createHiddenFieldAdminConfig(): Record<string, FieldDef> {
  return {
    defaultValue: textField('defaultValue', {
      label: 'Hidden Value',
      placeholder: 'Value to track (e.g., utm_source)',
      description: 'This value will be submitted with the form but not shown to users',
      rules: z.string().min(1, 'Hidden value is required')
    })
  }
}

/**
 * Convert admin config to composable field definition
 * Note: visibleWhen is NOT set here - it will be added by the conditions system
 * if the admin configured conditions. This allows hidden fields to be conditionally included.
 */
export function hiddenFieldToComposable(config: HiddenFieldConfig): FieldDef {
  return hiddenFieldComposable(config.id, {
    label: config.label,
    defaultValue: config.defaultValue,
    rules: z.string().optional()
  })
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
  toComposable: hiddenFieldToComposable,
  getDefaultValue: getHiddenFieldDefaultValue
}
