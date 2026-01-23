import * as z from 'zod'
import { defineForm, currencyField, fieldGroup } from '~/features/_library/form-builder/api'

/**
 * Campaign statistics & goal settings form
 * Handles goal amount setting
 */
export const useCampaignStatsSettingsForm = defineForm('campaign-stats', (_ctx) => {
  const goalAmount = currencyField('goalAmount', {
    label: 'Goal Amount',
    description: 'Target fundraising amount (optional)',
    placeholder: '50000',
    optional: true,
    min: 0,
    currencySymbol: '£',
    rules: z.number().min(1, 'Goal must be at least 1').optional()
  })

  const statsGroup = fieldGroup('stats', {
    label: 'Campaign Goal Settings',
    collapsible: true,
    collapsibleDefaultOpen: true,
    fields: {
      goalAmount
    }
  })

  return { stats: statsGroup }
})
