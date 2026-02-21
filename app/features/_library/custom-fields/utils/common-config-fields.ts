/**
 * Common admin config field builders
 * Shared field definitions used across multiple custom field factories
 * Reduces duplication while keeping each factory independent
 */
import * as z from 'zod'
import { textField, numberField, toggleField } from '~/features/_library/form-builder/api'
import type { FieldDef } from '~/features/_library/form-builder/types'

/**
 * Create the standard "Optional" toggle field.
 * Used in every field factory's advanced settings.
 */
export function createOptionalField(): FieldDef {
  return toggleField('optional', {
    label: 'Optional',
    description: 'Allow users to skip this field',
    defaultValue: true,
    rules: z.boolean().optional()
  })
}

/**
 * Create a placeholder text field.
 * Used in text, textarea, and select field factories.
 *
 * @param placeholder - Placeholder text for the placeholder input itself (default: 'Enter placeholder text...')
 */
export function createPlaceholderField(placeholder = 'Enter placeholder text...'): FieldDef {
  return textField('placeholder', {
    label: 'Placeholder',
    placeholder,
    optional: true,
    rules: z.string().optional()
  })
}

/**
 * Create a max length number field.
 * Used in text and textarea field factories.
 *
 * @param placeholder - Placeholder showing suggested max length (default: '100')
 */
export function createMaxLengthField(placeholder = '100'): FieldDef {
  return numberField('maxLength', {
    label: 'Maximum Length',
    placeholder,
    optional: true,
    min: 1,
    max: 10000,
    rules: z.number().min(1).max(10000).optional()
  })
}
