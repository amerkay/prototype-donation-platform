/**
 * Textarea Field Factory
 * Multi-line text input for longer responses
 */
import * as z from 'zod'
import type { TextareaFieldConfig } from '../types'
import { extractFieldValue } from './field-base'
import {
  fieldGroup,
  textField,
  numberField,
  toggleField,
  textareaField as textareaFieldConstructor
} from '~/features/_library/form-builder/api'
import type { FieldDef } from '~/features/_library/form-builder/types'

/**
 * Create admin configuration fields for textarea field
 */
export function createTextareaFieldAdminConfig(): Record<string, FieldDef> {
  return {
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      isSeparatorAfter: true,
      fields: {
        placeholder: textField('placeholder', {
          label: 'Placeholder',
          placeholder: 'Enter placeholder text...',
          optional: true,
          rules: z.string().optional()
        }),
        rows: numberField('rows', {
          label: 'Number of Rows',
          placeholder: '4',
          optional: true,
          min: 1,
          max: 20,
          defaultValue: 4,
          rules: z.number().min(1).max(20).optional()
        }),
        maxLength: numberField('maxLength', {
          label: 'Maximum Length',
          placeholder: '500',
          optional: true,
          min: 1,
          max: 10000,
          rules: z.number().min(1).max(10000).optional()
        }),
        optional: toggleField('optional', {
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        }),
        defaultValue: textareaFieldConstructor('defaultValue', {
          label: 'Default Value',
          placeholder: 'Optional default text',
          optional: true,
          rows: 3,
          rules: z.string().optional()
        })
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 */
export function textareaFieldToComposable(config: TextareaFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const placeholder = extractFieldValue<string>(configObj, 'placeholder')
  const rows = extractFieldValue<number>(configObj, 'rows')
  const maxLength = extractFieldValue<number>(configObj, 'maxLength')
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<string>(configObj, 'defaultValue', '')

  return textareaFieldConstructor(config.id, {
    label: config.label,
    placeholder,
    rows,
    maxLength,
    defaultValue,
    rules: optional ? z.string().optional() : z.string().min(1, `${config.label} is required`)
  })
}

/**
 * Extract default value from textarea field config
 */
export function getTextareaFieldDefaultValue(config: TextareaFieldConfig): string {
  return extractFieldValue<string>(config as unknown as Record<string, unknown>, 'defaultValue', '')
}

/**
 * Complete textarea field factory export
 */
export const textareaField = {
  createAdminConfig: createTextareaFieldAdminConfig,
  toComposable: textareaFieldToComposable,
  getDefaultValue: getTextareaFieldDefaultValue
}
