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
        options
      },
      // Honoree section - visible when type is not 'none'
      honoreeName: {
        type: 'field-group',
        label: 'Honoree',
        class: 'grid grid-cols-2 gap-4',
        visibleWhen: (values) => values.type !== 'none',
        fields: {
          honoreeFirstName: {
            type: 'text',
            label: 'First Name',
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
        description: 'Notify the recipient via email about this tribute donation',
        visibleWhen: (values) => values.type !== 'none'
      },
      // Same as honoree toggle - visible when sendECard is true and type is 'gift'
      sameAsHonoree: {
        type: 'toggle',
        label: 'Same Name as Honoree',
        description: 'Send the eCard directly to the gift recipient',
        visibleWhen: (values) => values.type === 'gift' && values.sendECard === true
      },
      // Recipient name fields - visible when sendECard is true and NOT sameAsHonoree
      recipientName: {
        type: 'field-group',
        label: 'eCard Recipient',
        class: 'grid grid-cols-2 gap-4',
        visibleWhen: (values) =>
          values.type !== 'none' && values.sendECard === true && values.sameAsHonoree !== true,
        fields: {
          recipientFirstName: {
            type: 'text',
            label: 'First Name',
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
          .string({ required_error: 'Email is required' })
          .min(1, 'Email is required')
          .email('Enter a valid email address')
      }
    }
  }
}
