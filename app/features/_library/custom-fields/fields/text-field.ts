/**
 * Text Field Factory
 * Single-line text input with optional validation
 */
import * as z from 'zod'
import type { TextFieldConfig } from '../types'
import { extractFieldValue } from './field-base'
import {
  createOptionalField,
  createPlaceholderField,
  createMaxLengthField
} from '../utils/common-config-fields'
import { fieldGroup, textField as textFieldConstructor } from '~/features/_library/form-builder/api'
import type { FieldDef } from '~/features/_library/form-builder/types'

/**
 * Create admin configuration fields for text field
 * Returns composable field definitions for admin panel
 */
export function createTextFieldAdminConfig(): Record<string, FieldDef> {
  return {
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      showSeparatorAfter: true,
      fields: {
        placeholder: createPlaceholderField(),
        maxLength: createMaxLengthField(),
        optional: createOptionalField(),
        defaultValue: textFieldConstructor('defaultValue', {
          label: 'Default Value',
          placeholder: 'Optional default text',
          optional: true,
          rules: z.string().optional()
        })
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 * Used when rendering the actual form from custom field config
 */
export function textFieldToComposable(config: TextFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const placeholder = extractFieldValue<string>(configObj, 'placeholder')
  const maxLength = extractFieldValue<number>(configObj, 'maxLength')
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<string>(configObj, 'defaultValue', '')

  return textFieldConstructor(config.id, {
    label: config.label,
    placeholder,
    maxLength,
    defaultValue,
    optional,
    rules: optional ? z.string().optional() : z.string().min(1, `${config.label} is required`)
  })
}

/**
 * Extract default value from text field config
 */
export function getTextFieldDefaultValue(config: TextFieldConfig): string {
  return extractFieldValue<string>(config as unknown as Record<string, unknown>, 'defaultValue', '')
}

/**
 * Complete text field factory export
 */
export const textField = {
  createAdminConfig: createTextFieldAdminConfig,
  toComposable: textFieldToComposable,
  getDefaultValue: getTextFieldDefaultValue
}
