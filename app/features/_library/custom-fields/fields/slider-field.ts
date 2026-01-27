/**
 * Slider Field Factory
 * Numeric range selector with visual feedback
 */
import * as z from 'zod'
import type { SliderFieldConfig } from '../types'
import { extractFieldValue } from './field-base'
import {
  fieldGroup,
  numberField,
  textField,
  toggleField,
  sliderField as sliderFieldConstructor
} from '~/features/_library/form-builder/api'
import type { FieldDef, FieldContext } from '~/features/_library/form-builder/types'

/**
 * Create admin configuration fields for slider field
 */
export function createSliderFieldAdminConfig(): Record<string, FieldDef> {
  return {
    min: numberField('min', {
      label: 'Minimum Value',
      placeholder: '0',
      defaultValue: 0,
      rules: z.number()
    }),
    max: numberField('max', {
      label: 'Maximum Value',
      placeholder: '100',
      defaultValue: 100,
      rules: z.number()
    }),
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      showSeparatorAfter: true,
      fields: {
        step: numberField('step', {
          label: 'Step',
          placeholder: '1',
          optional: true,
          min: 5,
          defaultValue: 5,
          rules: z.number().min(1).optional()
        }),
        prefix: textField('prefix', {
          label: 'Prefix',
          placeholder: '$',
          optional: true,
          rules: z.string().max(10).optional()
        }),
        suffix: textField('suffix', {
          label: 'Suffix',
          placeholder: '%',
          optional: true,
          rules: z.string().max(10).optional()
        }),
        optional: toggleField('optional', {
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        }),
        defaultValue: sliderFieldConstructor('defaultValue', {
          label: 'Default Value',
          description: 'Preview your slider configuration',
          optional: true,
          min: ({ parent }: FieldContext) => {
            return (parent?.min as number) ?? 0
          },
          max: ({ parent }: FieldContext) => {
            return (parent?.max as number) ?? 100
          },
          step: ({ values }: FieldContext) => (values.step as number) ?? 1,
          prefix: ({ values }: FieldContext) => (values.prefix as string) ?? undefined,
          suffix: ({ values }: FieldContext) => (values.suffix as string) ?? undefined,
          showMinMax: true,
          rules: ({ parent }: FieldContext) => {
            const min = (parent?.min as number) ?? 0
            const max = (parent?.max as number) ?? 100
            return z.number().min(min).max(max).optional()
          }
        })
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 */
export function sliderFieldToComposable(config: SliderFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const min = config.min
  const max = config.max
  const step = extractFieldValue<number>(configObj, 'step', 1)
  const prefix = extractFieldValue<string>(configObj, 'prefix')
  const suffix = extractFieldValue<string>(configObj, 'suffix')
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<number>(configObj, 'defaultValue')

  return sliderFieldConstructor(config.id, {
    label: config.label,
    min,
    max,
    step,
    prefix,
    suffix,
    showMinMax: true,
    defaultValue: defaultValue !== undefined ? defaultValue : min,
    rules: optional ? z.number().min(min).max(max).optional() : z.number().min(min).max(max)
  })
}

/**
 * Extract default value from slider field config
 */
export function getSliderFieldDefaultValue(config: SliderFieldConfig): number {
  const configObj = config as unknown as Record<string, unknown>
  const min = config.min
  const defaultValue = extractFieldValue<number>(configObj, 'defaultValue')
  return defaultValue !== undefined ? defaultValue : min
}

/**
 * Complete slider field factory export
 */
export const sliderField = {
  createAdminConfig: createSliderFieldAdminConfig,
  toComposable: sliderFieldToComposable,
  getDefaultValue: getSliderFieldDefaultValue
}
