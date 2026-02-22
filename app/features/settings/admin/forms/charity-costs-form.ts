import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  fieldGroup,
  arrayField
} from '~/features/_library/form-builder/api'

/**
 * Charity costs form section — org-level operational cost breakdown
 * Used in cover costs upsell modal on donation forms
 */
export const useCharityCostsForm = defineForm('charityCosts', (_ctx) => {
  const heading = textField('heading', {
    label: 'Modal Heading',
    description: 'Title shown at the top of the cost breakdown modal',
    placeholder: 'Help Us Keep More for the Orangutans',
    rules: z.string().min(1, 'Heading is required')
  })

  const introText = textareaField('introText', {
    label: 'Introduction Text',
    description: 'Shown above the cost table',
    placeholder: 'Running a modern charity requires essential technology and services...',
    rows: 3
  })

  const outroText = textareaField('outroText', {
    label: 'Closing Text',
    description: 'Shown below the cost table',
    placeholder: 'Your optional contribution helps offset these necessary costs...',
    rows: 3,
    showSeparatorAfter: true
  })

  const costs = arrayField('costs', {
    label: 'Operational Costs',
    description: 'Line items shown in the cost breakdown table',
    sortable: true,
    itemField: (itemValues: Record<string, unknown>) => {
      const service = itemValues.service as string | undefined
      const displayLabel = service || 'New Cost'

      return fieldGroup('', {
        label: displayLabel,
        collapsible: true,
        collapsibleDefaultOpen: false,
        fields: {
          service: textField('service', {
            label: 'Service Name',
            placeholder: 'e.g., Stripe',
            rules: z.string().min(1, 'Service name is required')
          }),
          purpose: textField('purpose', {
            label: 'Purpose',
            placeholder: 'e.g., Payment processing'
          }),
          annualCost: textField('annualCost', {
            label: 'Annual Cost',
            description: 'Number or text (e.g., "2500" or "2.9% + 20p")',
            placeholder: '2500'
          }),
          currency: textField('currency', {
            label: 'Currency Code',
            description: 'Leave empty for non-monetary costs (e.g., percentage-based)',
            placeholder: 'GBP'
          })
        }
      })
    },
    addButtonText: 'Add Cost Item',
    rules: z.array(
      z.object({
        service: z.string().min(1),
        purpose: z.string().optional().default(''),
        annualCost: z.string().optional().default(''),
        currency: z.string().optional().default('')
      })
    )
  })

  return { heading, introText, outroText, costs }
})
