import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  emojiField,
  textField,
  arrayField,
  currencyField
} from '~/features/_library/form-builder/api'

/**
 * Create impact journey config section definition
 * Ultra-simplified: just amount + label pairs
 */
export const useImpactJourneyConfigSection = defineForm('impactJourney', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Impact Journey',
    description: 'Auto-generates emotional impact messages based on donation amount',
    labelClass: 'font-bold',
    isSeparatorAfter: true
  })

  const emoji = emojiField('emoji', {
    label: 'Emoji',
    description: 'Shown in headline and CTA button',
    placeholder: '🌱',
    optional: true
  })

  const onceHeadline = textField('onceHeadline', {
    label: 'One-Time Headline',
    description: 'Default: "Your Support Today"',
    placeholder: 'Your Support Today',
    maxLength: 40,
    optional: true
  })

  const monthlyHeadline = textField('monthlyHeadline', {
    label: 'Monthly Headline',
    description: 'Default: "Every Day You\'re There"',
    placeholder: "Every Day You're There",
    maxLength: 40,
    optional: true
  })

  const yearlyHeadline = textField('yearlyHeadline', {
    label: 'Yearly Headline',
    description: 'Default: "Every Day You\'re There"',
    placeholder: "Every Day You're There",
    maxLength: 40,
    optional: true
  })

  const messaging = fieldGroup('messaging', {
    label: 'Messaging',
    description: 'Customize emotional messaging and visual identity',
    collapsible: true,
    collapsibleDefaultOpen: false,
    visibleWhen: ({ values }) => values.enabled === true,
    isSeparatorAfter: true,
    fields: { emoji, onceHeadline, monthlyHeadline, yearlyHeadline }
  })

  const impactAmount = currencyField('amount', {
    label: 'Amount',
    description: 'Amount threshold',
    placeholder: '10',
    currencySymbol: ({ values }) => {
      // Traverse up to get base currency from pricing config
      const baseCurrency =
        ((values as Record<string, unknown>)?.pricing as Record<string, unknown>)?.baseCurrency ||
        'GBP'
      return baseCurrency === 'USD' ? '$' : baseCurrency === 'EUR' ? '€' : '£'
    },
    rules: z.number().min(0.01, 'Must be positive')
  })

  const impactLabel = textField('label', {
    label: 'What This Provides',
    description: 'Keep it short (max 30 chars) for compact inline display',
    placeholder: 'Fresh fruit weekly',
    maxLength: 30,
    rules: z.string().min(1, 'Required').max(30, 'Max 30 characters')
  })

  const impactItemField = fieldGroup('', {
    label: ({ values }) => {
      const amt = ((values as Record<string, unknown>)?.amount as number) || 0
      const text = ((values as Record<string, unknown>)?.label as string) || ''
      if (!amt && !text) return 'New Impact Level'
      if (!amt) return text.length > 40 ? text.substring(0, 40) + '...' : text
      const truncated = text.length > 35 ? text.substring(0, 35) + '...' : text
      return truncated ? `£${amt} — ${truncated}` : `£${amt}`
    },
    collapsible: true,
    collapsibleDefaultOpen: false,
    class: 'grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4',
    fields: { amount: impactAmount, label: impactLabel }
  })

  const impactItems = arrayField('items', {
    label: '',
    itemField: impactItemField,
    addButtonText: 'Add Impact Level'
  })

  const impactPerAmount = fieldGroup('impactPerAmount', {
    label: 'Impact Per Amount',
    description:
      'Define what each amount provides (max 30 chars). System auto-adapts for one-time/monthly/yearly.',
    collapsible: true,
    collapsibleDefaultOpen: false,
    visibleWhen: ({ values }) => values.enabled === true,
    isSeparatorAfter: true,
    fields: { items: impactItems }
  })

  const upsellOnceToRecurring = toggleField('upsellOnceToRecurring', {
    label: 'One-Time to Recurring',
    description:
      'Shows upsell CTA on one-time tab. Auto-calculates target as ~66% of one-time amount, matches to closest monthly/yearly preset.'
  })

  const upsellCtaCopy = textField('upsellCtaCopy', {
    label: 'CTA Text',
    description: 'Button text for one-time to recurring conversion. Default: "Be Their Constant"',
    placeholder: 'Be Their Constant',
    maxLength: 20,
    optional: true,
    visibleWhen: ({ values }) => (values as Record<string, unknown>).upsellOnceToRecurring === true
  })

  const upsellIncreaseAmount = toggleField('upsellIncreaseAmount', {
    label: 'Amount Increase',
    description: 'Shows upsell CTA with next preset amount (e.g., "Increase to £50")'
  })

  const upsellIncreaseCtaCopy = textField('upsellIncreaseCtaCopy', {
    label: 'CTA Text',
    description: 'Button text for amount increase. Default: "Greater Impact"',
    placeholder: 'Greater Impact',
    maxLength: 20,
    optional: true,
    visibleWhen: ({ values }) => (values as Record<string, unknown>).upsellIncreaseAmount === true
  })

  const upsells = fieldGroup('upsells', {
    label: 'Upsell Prompts',
    description: 'CTAs to encourage recurring donations or higher amounts',
    collapsible: true,
    collapsibleDefaultOpen: false,
    visibleWhen: ({ values }) => values.enabled === true,
    isSeparatorAfter: true,
    fields: { upsellOnceToRecurring, upsellCtaCopy, upsellIncreaseAmount, upsellIncreaseCtaCopy }
  })

  return { enabled, messaging, impactPerAmount, upsells }
})
