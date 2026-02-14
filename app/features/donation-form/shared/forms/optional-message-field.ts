import * as z from 'zod'
import type { FieldDef } from '~/features/_library/form-builder/types'
import { toggleField, textareaField } from '~/features/_library/form-builder/api'

/**
 * Options for customizing message field labels and behavior
 */
export interface MessageFieldOptions {
  /** Label for the toggle field (default: 'Include a Message') */
  toggleLabel?: string
  /** Description for the toggle field (default: 'Why are you donating today?') */
  toggleDescription?: string
  /** Label for the textarea field (default: 'Your Message') */
  fieldLabel?: string
  /** Placeholder for the textarea (default: 'Enter your message (max 250 characters)') */
  placeholder?: string
  /** Visibility condition for the entire message section */
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean
}

/**
 * Create reusable message fields (toggle + textarea)
 *
 * Provides a consistent message input pattern with:
 * - Toggle to show/hide message field
 * - Textarea with 250 character limit
 * - Dynamic character counter
 * - Conditional validation
 *
 * @param options - Configuration options for customizing labels and visibility
 * @returns Object with isIncludeMessage toggle and message textarea fields
 *
 * @example
 * ```typescript
 * // Default usage (donor info form)
 * const fields = {
 *   ...otherFields,
 *   ...createMessageFields()
 * }
 *
 * // Custom labels (tribute form)
 * const fields = {
 *   ...otherFields,
 *   ...createMessageFields({
 *     toggleLabel: 'Include a message to recipient',
 *     toggleDescription: 'This message will be shown in the eCard email and the certificate',
 *     visibleWhen: ({ values }) => values.sendECard === true
 *   })
 * }
 * ```
 */
export function createMessageFields(options: MessageFieldOptions = {}): Record<string, FieldDef> {
  const {
    toggleLabel = 'Include a Message',
    toggleDescription = 'Why are you donating today?',
    fieldLabel = 'Your Message',
    placeholder = 'Enter your message (max 250 characters)',
    visibleWhen
  } = options

  const isIncludeMessage = toggleField('isIncludeMessage', {
    label: toggleLabel,
    description: toggleDescription,
    optional: true,
    visibleWhen,
    defaultValue: false
  })

  const message = textareaField('message', {
    label: fieldLabel,
    placeholder,
    maxLength: 250,
    showMaxLengthIndicator: true,
    defaultValue: '',
    visibleWhen: ({ values }) => {
      // First check parent visibility condition
      if (visibleWhen && !visibleWhen({ values })) {
        return false
      }
      // Then check if message toggle is enabled
      return values.isIncludeMessage === true
    },
    rules: ({ values }) =>
      values.isIncludeMessage === true
        ? z
            .string()
            .min(5, 'Message must be at least 5 characters')
            .max(250, 'Message must be 250 characters or less')
        : z.string().optional()
  })

  return { isIncludeMessage, message }
}
