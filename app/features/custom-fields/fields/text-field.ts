/**
 * Text Field Factory
 * Single-line text input with optional validation
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema } from './field-base'

/**
 * Text field configuration (admin-editable)
 */
export interface TextFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: string
  placeholder?: string
  maxLength?: number
}

/**
 * Create admin configuration fields for text field
 * Returns field-group definition for admin panel
 */
export function createTextFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        placeholder: {
          type: 'text',
          label: 'Placeholder',
          placeholder: 'Enter placeholder text...',
          optional: true,
          rules: z.string().optional()
        },
        maxLength: {
          type: 'number',
          label: 'Maximum Length',
          placeholder: '100',
          optional: true,
          min: 1,
          max: 10000,
          rules: z.number().min(1).max(10000).optional()
        },
        optional: {
          type: 'toggle',
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        },
        defaultValue: {
          type: 'text',
          label: 'Default Value',
          placeholder: 'Optional default text',
          optional: true,
          rules: z.string().optional()
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 * Used when rendering the actual form
 */
export function textFieldToFieldMeta(config: TextFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const placeholder = config.placeholder ?? (advancedSettings.placeholder as string | undefined)
  const maxLength = config.maxLength ?? (advancedSettings.maxLength as number | undefined)
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const defaultValue =
    config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'text' as const,
    placeholder,
    maxLength,
    defaultValue,
    rules: optional
      ? createOptionalSchema(z.string(), true)
      : z.string().min(1, `${config.label} is required`)
  }
}

/**
 * Extract default value from text field config
 */
export function getTextFieldDefaultValue(config: TextFieldConfig): string {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  return config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''
}

/**
 * Complete text field factory export
 */
export const textField = {
  createAdminConfig: createTextFieldAdminConfig,
  toFieldMeta: textFieldToFieldMeta,
  getDefaultValue: getTextFieldDefaultValue
}
