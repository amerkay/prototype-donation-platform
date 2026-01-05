/**
 * Checkbox Field Factory
 * Single checkbox (boolean) or checkbox array (string[]) with options
 */
import * as z from 'zod'
import type { FieldMeta } from '~/features/form-builder/types'
import { createBaseFieldMeta, slugify } from './field-base'

/**
 * Checkbox field configuration (admin-editable)
 */
export interface CheckboxFieldConfig {
  id: string
  label: string
  optional?: boolean
  defaultValue?: boolean | string[]
  options?: string[] // If provided, renders checkbox array; otherwise single checkbox
}

/**
 * Create admin configuration fields for checkbox field
 */
export function createCheckboxFieldAdminConfig(): Record<string, FieldMeta> {
  return {
    advancedSettings: {
      type: 'field-group',
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      fields: {
        options: {
          type: 'array',
          label: 'Checkbox Options',
          description: 'Leave empty for a single checkbox, or add options for a checkbox group',
          sortable: true,
          addButtonText: 'Add Option',
          optional: true,
          itemField: {
            type: 'text',
            placeholder: 'Enter option text',
            rules: z.string().min(1, 'Option text is required')
          },
          rules: z.array(z.string().min(1)).optional()
        },
        optional: {
          type: 'toggle',
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        }
      }
    }
  }
}

/**
 * Convert admin config to runtime field metadata
 */
export function checkboxFieldToFieldMeta(config: CheckboxFieldConfig): FieldMeta {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const optionLabels = config.options ?? (advancedSettings.options as string[] | undefined) ?? []
  const optional = config.optional ?? (advancedSettings.optional as boolean | undefined) ?? true
  const isArrayMode = optionLabels.length > 0

  // Convert string array to {value, label} objects for array mode
  const options = isArrayMode
    ? optionLabels.map((label) => ({
        value: slugify(label),
        label: String(label)
      }))
    : undefined

  const defaultValue = isArrayMode ? [] : false

  return {
    ...createBaseFieldMeta({ ...config, optional, defaultValue }),
    type: 'checkbox' as const,
    options,
    defaultValue,
    rules: isArrayMode
      ? optional
        ? z.array(z.string()).optional()
        : z.array(z.string()).min(1, `Please select at least one option`)
      : optional
        ? z.boolean().optional()
        : z.boolean().refine((v) => v === true, { message: `${config.label} is required` })
  }
}

/**
 * Extract default value from checkbox field config
 */
export function getCheckboxFieldDefaultValue(config: CheckboxFieldConfig): boolean | string[] {
  const advancedSettings =
    ((config as unknown as Record<string, unknown>).advancedSettings as
      | Record<string, unknown>
      | undefined) || {}
  const optionLabels = config.options ?? (advancedSettings.options as string[] | undefined) ?? []
  return optionLabels.length > 0 ? [] : false
}

/**
 * Complete checkbox field factory export
 */
export const checkboxField = {
  createAdminConfig: createCheckboxFieldAdminConfig,
  toFieldMeta: checkboxFieldToFieldMeta,
  getDefaultValue: getCheckboxFieldDefaultValue
}
