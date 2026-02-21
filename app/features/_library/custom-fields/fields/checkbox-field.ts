/**
 * Checkbox Field Factory
 * Single checkbox (boolean) or checkbox array (string[]) with options
 */
import * as z from 'zod'
import type { CheckboxFieldConfig } from '../types'
import { slugify, extractFieldValue } from './field-base'
import { createOptionalField } from '../utils/common-config-fields'
import {
  fieldGroup,
  textField,
  checkboxField as checkboxFieldConstructor,
  arrayField
} from '~/features/_library/form-builder/api'
import type { FieldDef } from '~/features/_library/form-builder/types'

/**
 * Create admin configuration fields for checkbox field
 */
export function createCheckboxFieldAdminConfig(): Record<string, FieldDef> {
  return {
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      showSeparatorAfter: true,
      fields: {
        options: arrayField('options', {
          label: 'Checkbox Options',
          description: 'Leave empty for a single checkbox, or add options for a checkbox group',
          sortable: true,
          addButtonText: 'Add Option',
          optional: true,
          itemField: textField('', {
            placeholder: 'Enter option text',
            rules: z.string().min(1, 'Option text is required')
          }),
          rules: z.array(z.string().min(1)).optional()
        }),
        optional: createOptionalField()
      }
    })
  }
}

/**
 * Convert admin config to composable field definition
 */
export function checkboxFieldToComposable(config: CheckboxFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const optionLabels = extractFieldValue<string[]>(configObj, 'options', [])
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const isArrayMode = optionLabels.length > 0

  // Convert string array to {value, label} objects for array mode
  const options = isArrayMode
    ? optionLabels.map((label) => ({
        value: slugify(label),
        label: String(label)
      }))
    : undefined

  const defaultValue = isArrayMode ? [] : false

  return checkboxFieldConstructor(config.id, {
    label: config.label,
    options,
    defaultValue,
    rules: isArrayMode
      ? optional
        ? z.array(z.string()).optional()
        : z.array(z.string()).min(1, `Please select at least one option`)
      : optional
        ? z.boolean().optional()
        : z.boolean().refine((v) => v === true, { message: `${config.label} is required` })
  })
}

/**
 * Extract default value from checkbox field config
 */
export function getCheckboxFieldDefaultValue(config: CheckboxFieldConfig): boolean | string[] {
  const optionLabels = extractFieldValue<string[]>(
    config as unknown as Record<string, unknown>,
    'options',
    []
  )
  return optionLabels.length > 0 ? [] : false
}

/**
 * Complete checkbox field factory export
 */
export const checkboxField = {
  createAdminConfig: createCheckboxFieldAdminConfig,
  toComposable: checkboxFieldToComposable,
  getDefaultValue: getCheckboxFieldDefaultValue
}
