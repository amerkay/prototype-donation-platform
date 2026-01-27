import * as z from 'zod'
import {
  defineForm,
  toggleField,
  currencyField,
  textareaField,
  componentField
} from '~/features/_library/form-builder/api'
import FundraisersList from '~/features/campaigns/admin/components/FundraisersList.vue'

/**
 * Peer-to-Peer (P2P) settings form
 * Handles fundraiser settings and permissions
 */
export const useP2PSettingsForm = defineForm('peerToPeer', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Peer-to-Peer Fundraising',
    description: 'Allow supporters to create their own fundraising pages for your campaign',
    labelClass: 'font-bold',
    showSeparatorAfter: true
  })

  const allowIndividuals = toggleField('allowIndividuals', {
    label: 'Individual Fundraisers',
    description: 'Allow individuals to create fundraising pages',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const allowTeams = toggleField('allowTeams', {
    label: 'Team Fundraisers',
    description: 'Allow teams to fundraise together',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const fundraiserGoalDefault = currencyField('fundraiserGoalDefault', {
    label: 'Default Fundraiser Goal',
    description: 'Suggested goal for new fundraisers (optional)',
    placeholder: '500',
    optional: true,
    min: 0,
    currencySymbol: '£',
    visibleWhen: ({ values }) => values.enabled === true,
    rules: z.number().min(1, 'Goal must be at least 1').optional()
  })

  const customMessage = textareaField('customMessage', {
    label: 'Invite Message',
    description: 'Custom message shown to new fundraisers',
    placeholder: 'Join our community of fundraisers...',
    rows: 3,
    optional: true,
    visibleWhen: ({ values }) => values.enabled === true,
    rules: z.string().optional(),
    showSeparatorAfter: true
  })

  const fundraisersList = componentField('fundraisersList', {
    component: FundraisersList,
    visibleWhen: ({ values }) => values.enabled === true,
    rules: z.any().optional()
  })

  return {
    enabled,
    allowIndividuals,
    allowTeams,
    fundraiserGoalDefault,
    customMessage,
    fundraisersList
  }
})
