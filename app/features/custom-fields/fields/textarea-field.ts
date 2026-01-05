/**
 * Textarea Field Factory
 * Multi-line text input for longer responses
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema } from './field-base'

/**
 * Textarea field configuration (admin-editable)
 */
export interface TextareaFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: string
  placeholder?: string
  rows?: number
  maxLength?: number
}

/**
 * Create admin configuration fields for textarea field
 */
export function createTextareaFieldAdminConfig(): Record<string, FieldMeta> {
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
        rows: {
          type: 'number',
          label: 'Number of Rows',
          placeholder: '4',
          optional: true,
          min: 1,
          max: 20,
          defaultValue: 4,
          rules: z.number().min(1).max(20).optional()
        },
        maxLength: {
          type: 'number',
          label: 'Maximum Length',
          placeholder: '500',
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
          type: 'textarea',
          label: 'Default Value',
          placeholder: 'Optional default text',
          optional: true,
          rows: 3,
          rules: z.string().optional()
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function textareaFieldToFieldMeta(config: TextareaFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const placeholder = config.placeholder ?? (advancedSettings.placeholder as string | undefined)
  const rows = config.rows ?? (advancedSettings.rows as number | undefined)
  const maxLength = config.maxLength ?? (advancedSettings.maxLength as number | undefined)
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const defaultValue =
    config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'textarea' as const,
    placeholder,
    rows,
    maxLength,
    defaultValue,
    rules: optional
      ? createOptionalSchema(z.string(), true)
      : z.string().min(1, `${config.label} is required`)
  }
}

/**
 * Extract default value from textarea field config
 */
export function getTextareaFieldDefaultValue(config: TextareaFieldConfig): string {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  return config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''
}

/**
 * Complete textarea field factory export
 */
export const textareaField = {
  createAdminConfig: createTextareaFieldAdminConfig,
  toFieldMeta: textareaFieldToFieldMeta,
  getDefaultValue: getTextareaFieldDefaultValue
}
