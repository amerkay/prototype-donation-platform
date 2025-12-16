import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import type { FormConfig } from '@/lib/common/types'

/**
 * Create tribute form section definition
 * Form fields, labels, placeholders, and validation are hardcoded here.
 * Only display config (icons, labels, modal title) comes from API config.
 */
export function createTributeFormSection(
  config: FormConfig['features']['tribute']
): ConfigSectionDef {
  // Build options based on enabled flags
  const options = [{ value: 'none', label: config.types.none.label }]
  if (config.types.gift.enabled) {
    options.push({ value: 'gift', label: config.types.gift.label })
  }
  if (config.types.memorial.enabled) {
    options.push({ value: 'memorial', label: config.types.memorial.label })
  }

  return {
    id: 'tribute-form',
    title: config.modal.title,
    description: config.modal.subtitle,
    fields: {
      type: {
        type: 'radio-group',
        label: 'Tribute Type',
        description: 'Make this donation a tribute to someone special',
        options,
        onChange: (value, allValues, setValue) => {
          // When switching to gift with eCard enabled, default sameAsHonoree to true
          // BUT only if recipient name is empty or matches honoree
          if (value === 'gift' && allValues.sendECard === true) {
            // Access nested field-group values correctly
            const honoreeName = (allValues.honoreeName as Record<string, unknown>) || {}
            const recipientName = (allValues.recipientName as Record<string, unknown>) || {}

            const recipientFirst = (recipientName.recipientFirstName as string | undefined) || ''
            const recipientLast = (recipientName.recipientLastName as string | undefined) || ''
            const honoreeFirst = (honoreeName.honoreeFirstName as string | undefined) || ''
            const honoreeLast = (honoreeName.honoreeLastName as string | undefined) || ''

            // Check if user has entered a different recipient name
            const hasRecipientName = recipientFirst.trim() !== '' || recipientLast.trim() !== ''
            const namesDiffer =
              recipientFirst.trim() !== honoreeFirst.trim() ||
              recipientLast.trim() !== honoreeLast.trim()

            console.log('[Tribute] Type onChange:', {
              recipientFirst,
              recipientLast,
              honoreeFirst,
              honoreeLast,
              hasRecipientName,
              namesDiffer
            })

            // Only set to true if no recipient name entered OR names match exactly
            if (!hasRecipientName || !namesDiffer) {
              console.log('[Tribute] Setting sameAsHonoree to true')
              setValue('sameAsHonoree', true)
            } else {
              console.log(
                '[Tribute] Preserving different recipient name, NOT setting sameAsHonoree'
              )
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
        description: 'Notify the recipient via email about this tribute donation',
        visibleWhen: (values) => values.type !== 'none',
        isNoSeparatorAfter: true,
        onChange: (value, allValues, setValue) => {
          // When enabling eCard for gift, default sameAsHonoree to true
          // BUT only if recipient name is empty or matches honoree
          if (value === true && allValues.type === 'gift') {
            // Access nested field-group values correctly
            const honoreeName = (allValues.honoreeName as Record<string, unknown>) || {}
            const recipientName = (allValues.recipientName as Record<string, unknown>) || {}

            const recipientFirst = (recipientName.recipientFirstName as string | undefined) || ''
            const recipientLast = (recipientName.recipientLastName as string | undefined) || ''
            const honoreeFirst = (honoreeName.honoreeFirstName as string | undefined) || ''
            const honoreeLast = (honoreeName.honoreeLastName as string | undefined) || ''

            // Check if user has entered a different recipient name
            const hasRecipientName = recipientFirst.trim() !== '' || recipientLast.trim() !== ''
            const namesDiffer =
              recipientFirst.trim() !== honoreeFirst.trim() ||
              recipientLast.trim() !== honoreeLast.trim()

            console.log('[Tribute] sendECard onChange:', {
              recipientFirst,
              recipientLast,
              honoreeFirst,
              honoreeLast,
              hasRecipientName,
              namesDiffer
            })

            // Only set to true if no recipient name entered OR names match exactly
            if (!hasRecipientName || !namesDiffer) {
              console.log('[Tribute] Setting sameAsHonoree to true')
              setValue('sameAsHonoree', true)
            } else {
              console.log(
                '[Tribute] Preserving different recipient name, NOT setting sameAsHonoree'
              )
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
        visibleWhen: (values) => values.type !== 'none' && values.sendECard === true,
        rules: z
          .string({ error: 'Email is required' })
          .min(1, 'Email is required')
          .email('Enter a valid email address')
      }
    }
  }
}
