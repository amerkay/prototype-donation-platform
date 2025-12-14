import * as z from 'zod'
import type { ConfigSectionDef } from '@/lib/form-builder/types'
import type { FormConfig } from '@/lib/common/types'

/**
 * Create tribute form schema with conditional validation
 */
export function createTributeFormSchema(config: FormConfig['features']['tribute']) {
  return z
    .object({
      type: z.enum(['none', 'gift', 'memorial']),
      honoreeFirstName: z.string().optional(),
      honoreeLastName: z.string().optional(),
      relationship: z.string().optional(),
      sendECard: z.boolean(),
      sameAsHonoree: z.boolean().optional(),
      recipientFirstName: z.string().optional(),
      recipientLastName: z.string().optional(),
      recipientEmail: z.string().optional()
    })
    .superRefine((data, ctx) => {
      // Honoree validation when type is not 'none'
      if (data.type !== 'none') {
        if (!data.honoreeFirstName || data.honoreeFirstName.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: config.validation.honoreeFirstName.minLength,
            path: ['honoreeFirstName']
          })
        }

        // eCard recipient validation when sendECard is true
        if (data.sendECard) {
          const hasRecipientName = data.recipientFirstName || data.recipientLastName

          if (hasRecipientName && !data.sameAsHonoree) {
            if (!data.recipientFirstName || data.recipientFirstName.length < 2) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: config.validation.recipientFirstName.minLength,
                path: ['recipientFirstName']
              })
            }
          }

          // Email is required when sending eCard
          if (!data.recipientEmail) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: config.validation.recipientEmail.required,
              path: ['recipientEmail']
            })
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.recipientEmail)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: config.validation.recipientEmail.invalid,
              path: ['recipientEmail']
            })
          }
        }
      }
    })
}

/**
 * Create tribute form section definition
 */
export function createTributeFormSection(
  config: FormConfig['features']['tribute']
): ConfigSectionDef<ReturnType<typeof createTributeFormSchema>> {
  return {
    id: 'tribute-form',
    title: config.modal.title,
    description: config.modal.subtitle,
    schema: createTributeFormSchema(config),
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
        class: 'col-span-1'
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
        class: 'col-span-1'
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
        visibleWhen: (values) => values.type !== 'none' && values.sendECard === true
      }
    }
  }
}
