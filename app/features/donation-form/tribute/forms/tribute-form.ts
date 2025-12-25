import * as z from 'zod'
import type { FormDef } from '~/features/form-builder/types'
import type { TributeSettings } from '../types'
import { createMessageFields } from '~/features/donation-form/forms/optional-message-field'

/**
 * Determine if sameAsHonoree should default to true
 * Returns true if recipient name is empty OR matches honoree name exactly
 */
function shouldDefaultSameAsHonoree(allValues: Record<string, unknown>): boolean {
  const honoreeName = (allValues.honoreeName as Record<string, unknown>) || {}
  const recipientName = (allValues.recipientName as Record<string, unknown>) || {}

  const honoreeFirst = ((honoreeName.honoreeFirstName as string | undefined) || '').trim()
  const honoreeLast = ((honoreeName.honoreeLastName as string | undefined) || '').trim()
  const recipientFirst = ((recipientName.recipientFirstName as string | undefined) || '').trim()
  const recipientLast = ((recipientName.recipientLastName as string | undefined) || '').trim()

  const hasRecipientName = recipientFirst !== '' || recipientLast !== ''
  const namesDiffer = recipientFirst !== honoreeFirst || recipientLast !== honoreeLast

  return !hasRecipientName || !namesDiffer
}

/**
 * Create tribute form section definition
 * Form fields, labels, placeholders, and validation are hardcoded here.
 * Only display config (icons, labels, modal title) comes from API config.
 */
export function createTributeFormSection(config: TributeSettings): FormDef {
  // Build options based on enabled flags
  const options = [{ value: 'none', label: config.types.none.label }]
  if (config.types.giftEnabled) {
    options.push({ value: 'gift', label: '🎁 Gift to someone' })
  }
  if (config.types.memorialEnabled) {
    options.push({ value: 'memorial', label: '🕊️ In memory of someone' })
  }

  return {
    id: 'tribute-form',
    // title: config.modal.title,
    // description: config.modal.subtitle,
    fields: {
      type: {
        type: 'radio-group',
        label: 'Dedicate this donation',
        description: 'Make this donation a tribute to someone special',
        options,
        onChange: (value, allValues, setValue) => {
          // When switching to gift with eCard enabled, default sameAsHonoree to true
          // BUT only if recipient name is empty or matches honoree
          if (value === 'gift' && allValues.sendECard === true) {
            if (shouldDefaultSameAsHonoree(allValues)) {
              setValue('sameAsHonoree', true)
            }
          }
          // When switching to memorial, clear sameAsHonoree (field is hidden)
          else if (value === 'memorial') {
            setValue('sameAsHonoree', false)
          }
        }
      },
      // Honoree section - visible when type is not 'none'
      honoreeName: {
        type: 'field-group',
        // label: 'Honoree',
        class: 'grid grid-cols-2 gap-x-3',
        visibleWhen: (values) => values.type !== 'none',
        isNoSeparatorAfter: true,
        fields: {
          honoreeFirstName: {
            type: 'text',
            label: 'Honoree First Name',
            placeholder: 'First name',
            rules: z.string().min(2, 'First name must be at least 2 characters')
          },
          honoreeLastName: {
            type: 'text',
            label: 'Last Name',
            placeholder: 'Last name',
            optional: true
          }
        }
      },
      relationship: {
        type: 'select',
        label: 'Relationship',
        placeholder: 'Select relationship...',
        optional: true,
        options: config.relationships.map((r) => ({ value: r.value, label: r.label })),
        searchPlaceholder: 'Search relationship...',
        notFoundText: 'No relationship found.',
        visibleWhen: (values) => values.type !== 'none'
      },
      // eCard toggle - visible when type is not 'none'
      sendECard: {
        type: 'toggle',
        label: '📧 Send an eCard notification',
        labelClass: 'font-semibold',
        description: 'Send an eCard about your donation',
        visibleWhen: (values) => values.type !== 'none',
        isNoSeparatorAfter: true,
        onChange: (value, allValues, setValue) => {
          // When enabling eCard for gift, default sameAsHonoree to true
          // BUT only if recipient name is empty or matches honoree
          if (value === true && allValues.type === 'gift') {
            if (shouldDefaultSameAsHonoree(allValues)) {
              setValue('sameAsHonoree', true)
            }
          }
          // When disabling eCard, clear sameAsHonoree
          else if (value === false) {
            setValue('sameAsHonoree', false)
          }
        }
      },

      // Same as honoree toggle - visible when sendECard is true and type is 'gift' only
      sameAsHonoree: {
        type: 'toggle',
        label: 'Same Name as Honoree',
        description: 'The recipient is the same as the honoree',
        visibleWhen: (values) => values.type === 'gift' && values.sendECard === true,
        isNoSeparatorAfter: true
      },

      // Recipient name fields - visible when sendECard is true and NOT sameAsHonoree
      recipientName: {
        type: 'field-group',
        // label: 'eCard Reci pient',
        class: 'grid grid-cols-2 gap-x-3',
        isNoSeparatorAfter: true,
        visibleWhen: (values) =>
          values.type !== 'none' && values.sendECard === true && values.sameAsHonoree !== true,
        fields: {
          recipientFirstName: {
            type: 'text',
            label: 'Recipient First Name',
            placeholder: 'First name',
            rules: z.string().min(2, 'First name must be at least 2 characters')
          },
          recipientLastName: {
            type: 'text',
            label: 'Last Name',
            placeholder: 'Last name',
            optional: true
          }
        }
      },

      // Email - visible when sendECard is true
      recipientEmail: {
        type: 'text',
        label: 'Email Address',
        placeholder: 'name@example.com',
        autocomplete: 'email',
        visibleWhen: (values) => values.type !== 'none' && values.sendECard === true,
        isNoSeparatorAfter: true,
        rules: z
          .string({ error: 'Email is required' })
          .min(1, 'Email is required')
          .email('Enter a valid email address')
      },

      // Message fields - visible when sendECard is true
      ...createMessageFields((values) => values.type !== 'none' && values.sendECard === true)
    }
  }
}
