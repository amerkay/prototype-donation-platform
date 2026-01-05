/**
 * Slider Field Factory
 * Numeric range selector with visual feedback
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema } from './field-base'

/**
 * Slider field configuration (admin-editable)
 */
export interface SliderFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: number
  min: number
  max: number
  step?: number
  prefix?: string
  suffix?: string
}

/**
 * Create admin configuration fields for slider field
 */
export function createSliderFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    min: {
      type: 'number',
      label: 'Minimum Value',
      placeholder: '0',
      defaultValue: 0,
      rules: z.number()
    },
    max: {
      type: 'number',
      label: 'Maximum Value',
      placeholder: '100',
      defaultValue: 100,
      rules: z.number()
    },
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        step: {
          type: 'number',
          label: 'Step',
          placeholder: '1',
          optional: true,
          min: 5,
          defaultValue: 5,
          rules: z.number().min(1).optional()
        },
        prefix: {
          type: 'text',
          label: 'Prefix',
          placeholder: '$',
          optional: true,
          rules: z.string().max(10).optional()
        },
        suffix: {
          type: 'text',
          label: 'Suffix',
          placeholder: '%',
          optional: true,
          rules: z.string().max(10).optional()
        },
        optional: {
          type: 'toggle',
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        },
        defaultValue: {
          type: 'slider',
          label: 'Default Value',
          description: 'Preview your slider configuration',
          optional: true,
          min: ({ parent }) => {
            return (parent?.min as number) ?? 0
          },
          max: ({ parent }) => {
            return (parent?.max as number) ?? 100
          },
          step: ({ values }) => (values.step as number) ?? 1,
          prefix: ({ values }) => (values.prefix as string) ?? undefined,
          suffix: ({ values }) => (values.suffix as string) ?? undefined,
          showMinMax: true,
          rules: ({ parent }) => {
            const min = (parent?.min as number) ?? 0
            const max = (parent?.max as number) ?? 100
            return z.number().min(min).max(max).optional()
          }
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function sliderFieldToFieldMeta(config: SliderFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const min = config.min
  const max = config.max
  const step = config.step ?? (advancedSettings.step as number | undefined) ?? 1
  const prefix = config.prefix ?? (advancedSettings.prefix as string | undefined)
  const suffix = config.suffix ?? (advancedSettings.suffix as string | undefined)
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const defaultValue =
    config.defaultValue ?? (advancedSettings.defaultValue as number | undefined) ?? min

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'slider' as const,
    min,
    max,
    step,
    prefix,
    suffix,
    showMinMax: true,
    defaultValue,
    rules: optional
      ? createOptionalSchema(z.number().min(min).max(max), true)
      : z.number().min(min, `Must be at least ${min}`).max(max, `Must be at most ${max}`)
  }
}

/**
 * Extract default value from slider field config
 */
export function getSliderFieldDefaultValue(config: SliderFieldConfig): number {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  return config.defaultValue ?? (advancedSettings.defaultValue as number | undefined) ?? config.min
}

/**
 * Complete slider field factory export
 */
export const sliderField = {
  createAdminConfig: createSliderFieldAdminConfig,
  toFieldMeta: sliderFieldToFieldMeta,
  getDefaultValue: getSliderFieldDefaultValue
}
