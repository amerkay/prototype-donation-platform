import * as z from 'zod'
import type { FieldMetaMap } from '~/features/form-builder/types'

/**
 * Create reusable message fields (toggle + textarea)
 *
 * Provides a consistent message input pattern with:
 * - Toggle to show/hide message field
 * - Textarea with 250 character limit
 * - Dynamic character counter
 * - Conditional validation
 *
 * @param visibleWhen - Function that determines when message fields should be visible
 * @returns Object with isIncludeMessage toggle and message textarea fields
 *
 * @example
 * ```typescript
 * const fields = {
 *   ...otherFields,
 *   ...createMessageFields((values) => values.sendEmail === true)
 * }
 * ```
 */
export function createMessageFields(
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean
): FieldMetaMap {
  return {
    isIncludeMessage: {
      type: 'toggle',
      label: 'Include a Message',
      description: 'Why are you donating today?',
      optional: true,
      visibleWhen,
      defaultValue: false
    },
    message: {
      type: 'textarea',
      label: 'Your Message',
      placeholder: 'Enter your message (max 250 characters)',
      maxLength: 250,
      description: ({ values }) => {
        const msgLength = ((values.message as string) || '').length
        return `${msgLength}/250 characters`
      },
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
    }
  }
}
