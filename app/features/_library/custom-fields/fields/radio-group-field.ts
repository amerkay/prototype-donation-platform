/**
 * Radio Group Field Factory
 * Single-select options with radio buttons
 */
import * as z from 'zod'
import type { RadioGroupFieldConfig } from '../types'
import { slugify, extractFieldValue } from './field-base'
import { createOptionalField } from '../utils/common-config-fields'
import {
  fieldGroup,
  textField,
  selectField,
  radioGroupField as radioGroupFieldConstructor,
  arrayField
} from '~/features/_library/form-builder/api'
import type { FieldDef } from '~/features/_library/form-builder/types'

/**
 * Create admin configuration fields for radio group field
 */
export function createRadioGroupFieldAdminConfig(): Record<string, FieldDef> {
  return {
    options: arrayField('options', {
      label: 'Options',
      sortable: true,
      description: 'Add options for the radio group',
      addButtonText: 'Add Option',
      itemField: textField('', {
        placeholder: 'Enter option text',
        rules: z.string().min(1, 'Option text is required')
      }),
      rules: z.array(z.string().min(1)).min(2, 'At least two options are required')
    }),
    advancedSettings: fieldGroup('advancedSettings', {
      label: 'Advanced Settings',
      collapsible: true,
      collapsibleDefaultOpen: false,
      showSeparatorAfter: true,
      fields: {
        orientation: radioGroupFieldConstructor('orientation', {
          label: 'Layout',
          options: [
            { value: 'vertical', label: 'Vertical' },
            { value: 'horizontal', label: 'Horizontal' }
          ],
          defaultValue: 'vertical',
          rules: z.enum(['vertical', 'horizontal']).optional()
        }),
        optional: createOptionalField(),
        defaultValue: selectField('defaultValue', {
          label: 'Default Value',
          description: 'Select which option should be pre-selected',
          placeholder: 'No default selected',
          optional: true,
          options: ({ parent }: { parent?: Record<string, unknown> }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.map((label) => ({
              value: slugify(label),
              label: String(label)
            }))
          },
          visibleWhen: ({ parent }: { parent?: Record<string, unknown> }) => {
            const optionLabels = (parent?.options as string[]) ?? []
            return optionLabels.length >= 2
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
export function radioGroupFieldToComposable(config: RadioGroupFieldConfig): FieldDef {
  const configObj = config as unknown as Record<string, unknown>
  const optionLabels = config.options || []
  const orientation = extractFieldValue<'vertical' | 'horizontal'>(
    configObj,
    'orientation',
    'vertical'
  )
  const optional = extractFieldValue<boolean>(configObj, 'optional', true)
  const defaultValue = extractFieldValue<string>(configObj, 'defaultValue', '')

  // Convert string array to {value, label} objects
  const options = optionLabels.map((label) => ({
    value: slugify(label),
    label: String(label)
  }))

  return radioGroupFieldConstructor(config.id, {
    label: config.label,
    options,
    orientation,
    defaultValue,
    rules: optional ? z.string().optional() : z.string().min(1, `${config.label} is required`)
  })
}

/**
 * Extract default value from radio group field config
 */
export function getRadioGroupFieldDefaultValue(config: RadioGroupFieldConfig): string {
  return extractFieldValue<string>(config as unknown as Record<string, unknown>, 'defaultValue', '')
}

/**
 * Complete radio group field factory export
 */
export const radioGroupField = {
  createAdminConfig: createRadioGroupFieldAdminConfig,
  toComposable: radioGroupFieldToComposable,
  getDefaultValue: getRadioGroupFieldDefaultValue
}
