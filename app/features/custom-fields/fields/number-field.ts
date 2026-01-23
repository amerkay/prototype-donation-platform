/**
 * Number Field Factory
 * Numeric input with optional min/max/step constraints
 */
import * as z from 'zod'
import type { NumberFieldConfig } from '../types'
import { extractFieldValue } from './field-base'
import {
  fieldGroup,
  numberField as numberFieldConstructor,
  toggleField
} from '~/features/form-builder/api'
import type { FieldDef } from '~/features/form-builder/types'

/**
 * Create admin configuration fields for number field
 */
export function createNumberFieldAdminConfig(): Record<string, FieldDef> {
  return {
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      isSeparatorAfter: true,
      fields: {
        min: numberFieldConstructor('min', {
          label: 'Minimum Value',
          placeholder: 'No minimum',
          optional: true,
          rules: z.number().optional()
        }),
        max: numberFieldConstructor('max', {
          label: 'Maximum Value',
          placeholder: 'No maximum',
          optional: true,
          rules: z.number().optional()
        }),
        step: numberFieldConstructor('step', {
          label: 'Step',
          placeholder: '1',
          optional: true,
          min: 0,
          rules: z.number().min(1).optional()
        }),
        optional: toggleField('optional', {
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        }),
        defaultValue: numberFieldConstructor('defaultValue', {
          label: 'Default Value',
          placeholder: 'Optional default number',
          optional: true,
          rules: z.number().optional()
        })
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 */
export function numberFieldToComposable(config: NumberFieldConfig): FieldDef {
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

  return numberFieldConstructor(config.id, {
    label: config.label,
    min,
    max,
    step,
    defaultValue,
    rules: optional ? schema.optional() : schema
  })
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
  toComposable: numberFieldToComposable,
  getDefaultValue: getNumberFieldDefaultValue
}
