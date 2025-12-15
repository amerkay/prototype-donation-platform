import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'
import type { FormConfig } from '@/lib/common/types'

/**
 * Create tribute form section definition
 * Uses field-level validation only to avoid Zod refine issues with dynamic forms
 */
export function createTributeFormSection(
  config: FormConfig['features']['tribute']
): ConfigSectionDef {
  return {
    id: 'tribute-form',
    title: config.modal.title,
    description: config.modal.subtitle,
    fields: {
      type: {
        type: 'radio-group',
        label: config.form.tributeTypeSection.legend,
        description: config.form.tributeTypeSection.description,
        options: [
          { value: 'none', label: config.types.none.label },
          { value: 'gift', label: config.types.gift.label },
          { value: 'memorial', label: config.types.memorial.label }
        ]
      },
      // Honoree section - visible when type is not 'none'
      honoreeFirstName: {
        type: 'text',
        label: config.form.honoreeSection.fields.firstName.label,
        placeholder: config.form.honoreeSection.fields.firstName.placeholder,
        visibleWhen: (values) => values.type !== 'none',
        class: 'col-span-1',
        rules: z.string().min(2, config.validation.honoreeFirstName.minLength)
      },
      honoreeLastName: {
        type: 'text',
        label: config.form.honoreeSection.fields.lastName.label,
        placeholder: config.form.honoreeSection.fields.lastName.placeholder,
        optional: true,
        visibleWhen: (values) => values.type !== 'none',
        class: 'col-span-1'
      },
      relationship: {
        type: 'select',
        label: config.form.honoreeSection.fields.relationship.label,
        placeholder: config.form.honoreeSection.fields.relationship.placeholder,
        optional: true,
        options: config.relationships.map((r) => ({ value: r.value, label: r.label })),
        searchPlaceholder: config.form.honoreeSection.fields.relationship.searchPlaceholder,
        notFoundText: config.form.honoreeSection.fields.relationship.notFound,
        visibleWhen: (values) => values.type !== 'none'
      },
      // eCard toggle - visible when type is not 'none'
      sendECard: {
        type: 'toggle',
        label: config.form.eCardSection.toggle.title,
        description: config.form.eCardSection.toggle.description,
        visibleWhen: (values) => values.type !== 'none'
      },
      // Same as honoree toggle - visible when sendECard is true and type is 'gift'
      sameAsHonoree: {
        type: 'toggle',
        label: 'Send to the gift recipient',
        description: config.form.eCardSection.sameAsHonoree.description,
        visibleWhen: (values) => values.type === 'gift' && values.sendECard === true
      },
      // Recipient name fields - visible when sendECard is true and NOT sameAsHonoree
      recipientFirstName: {
        type: 'text',
        label: config.form.eCardSection.fields.firstName.label,
        placeholder: config.form.eCardSection.fields.firstName.placeholder,
        visibleWhen: (values) =>
          values.type !== 'none' && values.sendECard === true && values.sameAsHonoree !== true,
        class: 'col-span-1',
        rules: z.string().min(2, config.validation.recipientFirstName.minLength)
      },
      recipientLastName: {
        type: 'text',
        label: config.form.eCardSection.fields.lastName.label,
        placeholder: config.form.eCardSection.fields.lastName.placeholder,
        optional: true,
        visibleWhen: (values) =>
          values.type !== 'none' && values.sendECard === true && values.sameAsHonoree !== true,
        class: 'col-span-1'
      },
      // Email - visible when sendECard is true
      recipientEmail: {
        type: 'text',
        label: config.form.eCardSection.fields.email.label,
        placeholder: config.form.eCardSection.fields.email.placeholder,
        visibleWhen: (values) => values.type !== 'none' && values.sendECard === true,
        rules: z
          .string({ required_error: config.validation.recipientEmail.required })
          .min(1, config.validation.recipientEmail.required)
          .email(config.validation.recipientEmail.invalid)
      }
    }
  }
}
