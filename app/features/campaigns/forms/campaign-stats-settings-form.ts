import * as z from 'zod'
import { defineForm, currencyField, toggleField, fieldGroup } from '~/features/form-builder/api'

/**
 * Campaign statistics & goal settings form
 * Handles goal amount and related settings
 */
export const useCampaignStatsSettingsForm = defineForm('campaign-stats', (_ctx) => {
  const goalAmount = currencyField('goalAmount', {
    label: 'Goal Amount',
    description: 'Target fundraising amount (optional)',
    placeholder: '50000',
    optional: true,
    min: 0,
    rules: z.number().min(1, 'Goal must be at least 1').optional()
  })

  const includeGiftAidInGoal = toggleField('includeGiftAidInGoal', {
    label: 'Include Gift Aid in Goal',
    description: 'Count Gift Aid contributions towards the goal amount',
    optional: true,
    visibleWhen: ({ values }) => !!values.goalAmount
  })

  const statsGroup = fieldGroup('stats', {
    label: 'Campaign Goal Settings',
    collapsible: true,
    collapsibleDefaultOpen: true,
    fields: {
      goalAmount,
      includeGiftAidInGoal
    }
  })

  return { stats: statsGroup }
})
