/**
 * Select Field Factory
 * Dropdown selector with predefined options
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, createOptionalSchema, slugify } from './field-base'

/**
 * Select field configuration (admin-editable)
 */
export interface SelectFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: string
  placeholder?: string
  options: string[] // Array of option labels (values auto-generated)
}

/**
 * Create admin configuration fields for select field
 */
export function createSelectFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    options: {
      type: 'array',
      label: 'Options',
      sortable: true,
      description: 'Add options for the dropdown',
      addButtonText: 'Add Option',
      itemField: {
        type: 'text',
        // label: 'Option',
        placeholder: 'Enter option text',
        rules: z.string().min(1, 'Option text is required')
      },
      rules: z.array(z.string().min(1)).min(1, 'At least one option is required')
    },
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        placeholder: {
          type: 'text',
          label: 'Placeholder',
          placeholder: 'Select an option...',
          optional: true,
          rules: z.string().optional()
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
          placeholder: 'Select default option...',
          description: 'Preview your dropdown options',
          optional: true,
          options: ({ parent }) => {
            const optionLabels = (parent?.options as string[]) ?? []

            // Convert string array to {value, label} objects (same logic as runtime conversion)
            return optionLabels.map((label) => ({
              value: slugify(label),
              label: String(label)
            }))
          },
          visibleWhen: ({ parent }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.length > 0
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
export function selectFieldToFieldMeta(config: SelectFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const optionLabels = config.options || []
  const placeholder = config.placeholder ?? (advancedSettings.placeholder as string | undefined)
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const defaultValue =
    config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''

  // Convert string array to {value, label} objects (auto-generate values from labels)
  const options = optionLabels.map((label) => ({
    value: slugify(label),
    label: String(label)
  }))

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'select' as const,
    placeholder,
    options,
    defaultValue,
    rules: optional
      ? createOptionalSchema(z.string(), true)
      : z.string().min(1, `${config.label} is required`)
  }
}

/**
 * Extract default value from select field config
 */
export function getSelectFieldDefaultValue(config: SelectFieldConfig): string {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  return config.defaultValue ?? (advancedSettings.defaultValue as string | undefined) ?? ''
}

/**
 * Complete select field factory export
 */
export const selectField = {
  createAdminConfig: createSelectFieldAdminConfig,
  toFieldMeta: selectFieldToFieldMeta,
  getDefaultValue: getSelectFieldDefaultValue
}
