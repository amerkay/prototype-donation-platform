/**
 * Radio Group Field Factory
 * Single-select options with radio buttons
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema, slugify } from './field-base'

/**
 * Radio group field configuration (admin-editable)
 */
export interface RadioGroupFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: string
  options: string[] // Array of option labels (values auto-generated)
  orientation?: 'vertical' | 'horizontal'
}

/**
 * Create admin configuration fields for radio group field
 */
export function createRadioGroupFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    options: {
      type: 'array',
      label: 'Options',
      sortable: true,
      description: 'Add options for the radio group',
      addButtonText: 'Add Option',
      itemField: {
        type: 'text',
        placeholder: 'Enter option text',
        rules: z.string().min(1, 'Option text is required')
      },
      rules: z.array(z.string().min(1)).min(2, 'At least two options are required')
    },
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        orientation: {
          type: 'radio-group',
          label: 'Layout',
          options: [
            { value: 'vertical', label: 'Vertical' },
            { value: 'horizontal', label: 'Horizontal' }
          ],
          defaultValue: 'vertical',
          rules: z.enum(['vertical', 'horizontal']).optional()
        },
        optional: {
          type: 'toggle',
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        },
        defaultValue: {
          type: 'select',
          label: 'Default Value',
          description: 'Select which option should be pre-selected',
          placeholder: 'No default selected',
          optional: true,
          options: ({ parent }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.map((label) => ({
              value: slugify(label),
              label: String(label)
            }))
          },
          visibleWhen: ({ parent }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.length >= 2
          },
          rules: z.string().optional()
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function radioGroupFieldToFieldMeta(config: RadioGroupFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const optionLabels = config.options || []
  const orientation =
    config.orientation ??
    (advancedSettings.orientation as 'vertical' | 'horizontal' | undefined) ??
    'vertical'
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const defaultValue =
    config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''

  // Convert string array to {value, label} objects
  const options = optionLabels.map((label) => ({
    value: slugify(label),
    label: String(label)
  }))

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'radio-group' as const,
    options,
    orientation,
    defaultValue,
    rules: optional
      ? createOptionalSchema(z.string(), true)
      : z.string().min(1, `${config.label} is required`)
  }
}

/**
 * Extract default value from radio group field config
 */
export function getRadioGroupFieldDefaultValue(config: RadioGroupFieldConfig): string {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  return config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''
}

/**
 * Complete radio group field factory export
 */
export const radioGroupField = {
  createAdminConfig: createRadioGroupFieldAdminConfig,
  toFieldMeta: radioGroupFieldToFieldMeta,
  getDefaultValue: getRadioGroupFieldDefaultValue
}
