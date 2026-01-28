import * as z from 'zod'
import {
  defineForm,
  toggleField,
  fieldGroup,
  textareaField
} from '~/features/_library/form-builder/api'

/**
 * Create impact boost config section definition
 * Ultra-simplified: just 2 emotional messages for upsells
 */
export const useImpactBoostConfigSection = defineForm('impactBoost', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Impact Boost',
    description: 'Show emotional upsell prompts to encourage recurring donations or higher amounts',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const recurringBoostMessage = textareaField('recurringBoostMessage', {
    label: 'Recurring Boost Message',
    description: 'Emotional appeal shown to one-time donors (max 150 chars)',
    placeholder: 'Your monthly gift means they can count on you every single day',
    defaultValue: 'Your monthly gift means they can count on you every single day',
    maxLength: 150,
    rows: 2,
    rules: z.string().min(1, 'Required').max(150, 'Max 150 characters')
  })

  const increaseBoostMessage = textareaField('increaseBoostMessage', {
    label: 'Increase Boost Message',
    description: 'Emotional appeal for increasing donation amount (max 150 chars)',
    placeholder: 'A little more today creates lasting change tomorrow',
    defaultValue: 'A little more today creates lasting change tomorrow',
    maxLength: 150,
    rows: 2,
    rules: z.string().min(1, 'Required').max(150, 'Max 150 characters')
  })

  const messages = fieldGroup('messages', {
    label: 'Messages',
    description: 'Customize emotional appeals for each upsell scenario',
    collapsible: true,
    collapsibleDefaultOpen: false,
    visibleWhen: ({ values }) => values.enabled === true,
    showSeparatorAfter: true,
    fields: { recurringBoostMessage, increaseBoostMessage }
  })

  const enableRecurringBoost = toggleField('enableRecurringBoost', {
    label: 'Enable Recurring Boost',
    description:
      'Show CTA to convert one-time donors to recurring (auto-calculates ~66% of one-time amount)',
    defaultValue: true
  })

  const enableIncreaseBoost = toggleField('enableIncreaseBoost', {
    label: 'Enable Increase Boost',
    description: 'Show CTA to increase donation to next preset amount',
    defaultValue: true
  })

  const upsells = fieldGroup('upsells', {
    label: 'Upsell Options',
    description: 'Choose which upsell prompts to display',
    collapsible: true,
    collapsibleDefaultOpen: false,
    visibleWhen: ({ values }) => values.enabled === true,
    showSeparatorAfter: true,
    fields: { enableRecurringBoost, enableIncreaseBoost },
    rules: z
      .object({
        enableRecurringBoost: z.boolean().optional(),
        enableIncreaseBoost: z.boolean().optional()
      })
      .refine((val) => val.enableRecurringBoost || val.enableIncreaseBoost, {
        message: 'At least one upsell option must be enabled'
      })
  })

  return { enabled, messages, upsells }
})
