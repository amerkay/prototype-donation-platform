import * as z from 'zod'
import { defineForm, toggleField, componentField } from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import FundraisersList from '~/features/campaigns/admin/components/FundraisersList.vue'

/**
 * Peer-to-Peer (P2P) settings form
 * Handles fundraiser list display
 */
export const useP2PSettingsForm = defineForm('peerToPeer', (_ctx) => {
  const store = useCampaignConfigStore()

  const enabled = toggleField('enabled', {
    label: 'Enable Peer-to-Peer Fundraising',
    description: 'Allow supporters to create their own fundraising pages for your campaign',
    labelClass: 'font-bold',
    showSeparatorAfter: true,
    // For P2P campaigns, enabled is always on and hidden
    visibleWhen: () => !store.isP2P
  })

  const isP2PEnabled = ({ values }: { values: Record<string, unknown> }) =>
    values.enabled === true || store.isP2P

  const fundraisersList = componentField('fundraisersList', {
    component: FundraisersList,
    visibleWhen: isP2PEnabled,
    rules: z.any().optional()
  })

  return {
    enabled,
    fundraisersList
  }
})
