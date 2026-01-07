/**
 * Number Field Factory
 * Numeric input with optional min/max/step constraints
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema, extractFieldValue } from './field-base'

/**
 * Number field configuration (admin-editable)
 */
export interface NumberFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: number
  min?: number
  max?: number
  step?: number
}

/**
 * Create admin configuration fields for number field
 */
export function createNumberFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        min: {
          type: 'number',
          label: 'Minimum Value',
          placeholder: 'No minimum',
          optional: true,
          rules: z.number().optional()
        },
        max: {
          type: 'number',
          label: 'Maximum Value',
          placeholder: 'No maximum',
          optional: true,
          rules: z.number().optional()
        },
        step: {
          type: 'number',
          label: 'Step',
          placeholder: '1',
          optional: true,
          min: 0,
          rules: z.number().min(1).optional()
        },
        optional: {
          type: 'toggle',
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        },
        defaultValue: {
          type: 'number',
          label: 'Default Value',
          placeholder: 'Optional default number',
          optional: true,
          rules: z.number().optional()
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function numberFieldToFieldMeta(config: NumberFieldConfig): FieldMeta {
  const configObj = config as unknown as Record<string, unknown>
  const min = extractFieldValue<number>(configObj, 'min')
  const max = extractFieldValue<number>(configObj, 'max')
  const step = extractFieldValue<number>(configObj, 'step')
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<number>(configObj, 'defaultValue')

  // Build validation schema with constraints
  let schema = z.number()
  if (min !== undefined) schema = schema.min(min, `Must be at least ${min}`)
  if (max !== undefined) schema = schema.max(max, `Must be at most ${max}`)

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'number' as const,
    min,
    max,
    step,
    defaultValue,
    rules: optional ? createOptionalSchema(schema, true) : schema
  }
}

/**
 * Extract default value from number field config
 */
export function getNumberFieldDefaultValue(config: NumberFieldConfig): number | undefined {
  return extractFieldValue<number>(config as unknown as Record<string, unknown>, 'defaultValue')
}

/**
 * Complete number field factory export
 */
export const numberField = {
  createAdminConfig: createNumberFieldAdminConfig,
  toFieldMeta: numberFieldToFieldMeta,
  getDefaultValue: getNumberFieldDefaultValue
}
