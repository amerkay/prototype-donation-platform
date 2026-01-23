/**
 * Select Field Factory
 * Dropdown selector with predefined options
 */
import * as z from 'zod'
import type { SelectFieldConfig } from '../types'
import { slugify, extractFieldValue } from './field-base'
import {
  fieldGroup,
  textField,
  toggleField,
  selectField as selectFieldConstructor,
  arrayField
} from '~/features/form-builder/api'
import type { FieldDef } from '~/features/form-builder/types'

/**
 * Create admin configuration fields for select field
 */
export function createSelectFieldAdminConfig(): Record<string, FieldDef> {
  return {
    options: arrayField('options', {
      label: 'Options',
      sortable: true,
      description: 'Add options for the dropdown',
      addButtonText: 'Add Option',
      itemField: textField('', {
        placeholder: 'Enter option text',
        rules: z.string().min(1, 'Option text is required')
      }),
      rules: z.array(z.string().min(1)).min(1, 'At least one option is required')
    }),
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      isSeparatorAfter: true,
      fields: {
        placeholder: textField('placeholder', {
          label: 'Placeholder',
          placeholder: 'Select an option...',
          optional: true,
          rules: z.string().optional()
        }),
        optional: toggleField('optional', {
          label: 'Optional',
          description: 'Allow users to skip this field',
          defaultValue: true,
          rules: z.boolean().optional()
        }),
        defaultValue: selectFieldConstructor('defaultValue', {
          label: 'Default Value',
          placeholder: 'Select default option...',
          description: 'Preview your dropdown options',
          optional: true,
          options: ({ parent }: { parent?: Record<string, unknown> }) => {
            const optionLabels = (parent?.options as string[]) ?? []

            // Convert string array to {value, label} objects (same logic as runtime conversion)
            return optionLabels.map((label) => ({
              value: slugify(label),
              label: String(label)
            }))
          },
          visibleWhen: ({ parent }: { parent?: Record<string, unknown> }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.length > 0
          },
          rules: z.string().optional()
        })
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 */
export function selectFieldToComposable(config: SelectFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const optionLabels = config.options || []
  const placeholder = extractFieldValue<string>(configObj, 'placeholder')
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<string>(configObj, 'defaultValue', '')

  // Convert string array to {value, label} objects (auto-generate values from labels)
  const options = optionLabels.map((label) => ({
    value: slugify(label),
    label: String(label)
  }))

  return selectFieldConstructor(config.id, {
    label: config.label,
    placeholder,
    options,
    defaultValue,
    rules: optional ? z.string().optional() : z.string().min(1, `${config.label} is required`)
  })
}

/**
 * Extract default value from select field config
 */
export function getSelectFieldDefaultValue(config: SelectFieldConfig): string {
  return extractFieldValue<string>(config as unknown as Record<string, unknown>, 'defaultValue', '')
}

/**
 * Complete select field factory export
 */
export const selectField = {
  createAdminConfig: createSelectFieldAdminConfig,
  toComposable: selectFieldToComposable,
  getDefaultValue: getSelectFieldDefaultValue
}
