import * as z from 'zod'
import {
  defineForm,
  radioGroupField,
  fieldGroup,
  textField,
  selectField,
  toggleField
} from '~/features/_library/form-builder/api'
import type { ComposableForm } from '~/features/_library/form-builder/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import { createMessageFields } from '~/features/donation-form/shared/forms/optional-message-field'

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
export function createTributeFormSection(config: TributeSettings): ComposableForm {
  // Build options based on enabled flags
  const options = [{ value: 'none', label: config.types.none.label }]
  if (config.types.giftEnabled) {
    options.push({ value: 'gift', label: '🎁 Gift to someone' })
  }
  if (config.types.memorialEnabled) {
    options.push({ value: 'memorial', label: '🕊️ In memory of someone' })
  }

  return defineForm('tribute-form', (_ctx) => {
    // ctx.title = config.modal.title
    // ctx.description = config.modal.subtitle

    const type = radioGroupField('type', {
      label: 'Dedicate this donation',
      description: 'Make this donation a tribute to someone special',
      options,
      onChange: ({ value, values, setValue }) => {
        // When switching to gift with eCard enabled, default sameAsHonoree to true
        // BUT only if recipient name is empty or matches honoree
        if (value === 'gift' && values.sendECard === true) {
          if (shouldDefaultSameAsHonoree(values)) {
            setValue('sameAsHonoree', true)
          }
        }
        // When switching to memorial, clear sameAsHonoree (field is hidden)
        else if (value === 'memorial') {
          setValue('sameAsHonoree', false)
        }
      }
    })

    const honoreeFirstName = textField('honoreeFirstName', {
      label: 'Honoree First Name',
      placeholder: 'First name',
      defaultValue: '',
      rules: z.string().min(2, 'First name must be at least 2 characters')
    })

    const honoreeLastName = textField('honoreeLastName', {
      label: 'Last Name',
      placeholder: 'Last name',
      defaultValue: '',
      optional: true
    })

    const honoreeName = fieldGroup('honoreeName', {
      // label: 'Honoree',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: ({ values }) => values.type !== 'none',
      fields: { honoreeFirstName, honoreeLastName }
    })

    const relationship = selectField('relationship', {
      label: 'Relationship',
      placeholder: 'Select relationship...',
      defaultValue: '',
      optional: true,
      options: config.relationships.map((r: { value: string; label: string }) => ({
        value: r.value,
        label: r.label
      })),
      searchPlaceholder: 'Search relationship...',
      notFoundText: 'No relationship found.',
      visibleWhen: ({ values }) => values.type !== 'none',
      showSeparatorAfter: true
    })

    const sendECard = toggleField('sendECard', {
      label: '📧 Send an eCard notification',
      labelClass: 'font-semibold',
      description: 'Send an eCard about your donation',
      defaultValue: false,
      visibleWhen: ({ values }) => values.type !== 'none',
      showSeparatorAfter: false,
      onChange: ({ value, values, setValue }) => {
        // When enabling eCard for gift, default sameAsHonoree to true
        // BUT only if recipient name is empty or matches honoree
        if (value === true && values.type === 'gift') {
          if (shouldDefaultSameAsHonoree(values)) {
            setValue('sameAsHonoree', true)
          }
        }
        // When disabling eCard, clear sameAsHonoree
        else if (value === false) {
          setValue('sameAsHonoree', false)
        }
      }
    })

    const sameAsHonoree = toggleField('sameAsHonoree', {
      label: 'Same Name as Honoree',
      description: 'The recipient is the same as the honoree',
      defaultValue: false,
      visibleWhen: ({ values }) => values.type === 'gift' && values.sendECard === true
    })

    const recipientFirstName = textField('recipientFirstName', {
      label: 'Recipient First Name',
      placeholder: 'First name',
      defaultValue: '',
      rules: z.string().min(2, 'First name must be at least 2 characters')
    })

    const recipientLastName = textField('recipientLastName', {
      label: 'Last Name',
      placeholder: 'Last name',
      defaultValue: '',
      optional: true
    })

    const recipientName = fieldGroup('recipientName', {
      // label: 'eCard Recipient',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: ({ values }) =>
        values.type !== 'none' && values.sendECard === true && values.sameAsHonoree !== true,
      fields: { recipientFirstName, recipientLastName }
    })

    const recipientEmail = textField('recipientEmail', {
      label: 'Email Address',
      placeholder: 'name@example.com',
      autocomplete: 'email',
      defaultValue: '',
      visibleWhen: ({ values }) => values.type !== 'none' && values.sendECard === true,
      showSeparatorAfter: false,
      rules: z.string().min(1, 'Email is required').email('Enter a valid email address')
    })

    return {
      type,
      honoreeName,
      relationship,
      sendECard,
      sameAsHonoree,
      recipientName,
      recipientEmail,
      // Message fields - visible when sendECard is true
      ...createMessageFields(({ values }) => values.type !== 'none' && values.sendECard === true)
    }
  })
}
