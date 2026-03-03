import { defineForm, fieldGroup } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCampaignDonationFormsForm } from '~/features/campaigns/admin/forms/donation-forms-form'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useP2PSettingsForm } from '~/features/campaigns/features/p2p/admin/forms/p2p-settings-form'
import { useMatchedGivingSettingsForm } from '~/features/campaigns/features/matched-giving/admin/forms/matched-giving-settings-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

/**
 * Reactive state for currently open accordion
 * Exported for preview components to observe form state
 */
export const openAccordionId = ref<string | undefined>('campaignConfigMaster.donationForms')

/**
 * Master admin form that consolidates all campaign configuration sections
 * Each section is wrapped in a collapsible field-group with card styling
 *
 * Campaign type behavior:
 * - Standard: Donation Forms, Crowdfunding Page
 * - P2P Template: Donation Forms, Template Defaults, Fundraisers
 * - P2P Fundraiser: Crowdfunding Page only (non-collapsible, status in header)
 * - Standard/P2P/Event + Matching: shows Matched Giving section when caps().allowsMatchedGiving
 * - Event: Donation Forms, Crowdfunding Page
 */
export function createCampaignConfigMaster() {
  return defineForm('campaignConfigMaster', (ctx: FormContext) => {
    const store = useCampaignConfigStore()

    /** Campaign capabilities — determines which sections are visible */
    const caps = () => getCampaignCapabilities(store.type)

    // Extract fields from each sub-form by calling their setup functions
    const donationFormsFields = useCampaignDonationFormsForm.setup(ctx)
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const peerToPeerFields = useP2PSettingsForm.setup(ctx)
    const matchedGivingFields = useMatchedGivingSettingsForm.setup(ctx)

    // Lock all sections when campaign is in a terminal state
    const isStatusLocked = () => store.status === 'completed' || store.status === 'ended'

    // "Donation Forms" section - hidden for fundraiser (uses inline donation amounts instead)
    const donationForms = fieldGroup('donationForms', {
      label: 'Donation Forms',
      description: 'Configure donation form assignments for this campaign.',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: donationFormsFields,
      disabled: isStatusLocked,
      visibleWhen: () => !store.isFundraiser
    })

    // Crowdfunding Page - non-collapsible for fundraiser (it's the only visible section)
    const crowdfunding = fieldGroup('crowdfunding', {
      label: store.isP2P ? 'Template Defaults' : 'Crowdfunding Page',
      description: store.isP2P
        ? 'Default settings inherited by all fundraisers created from this template.'
        : 'Configure public page with title, story, cover photo, and progress tracking.',
      collapsible: !store.isFundraiser,
      collapsibleDefaultOpen: store.isFundraiser,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: crowdfundingFields,
      disabled: isStatusLocked
    })

    // Fundraisers section - only for P2P campaigns
    const peerToPeer = fieldGroup('peerToPeer', {
      label: 'Fundraisers',
      description: 'Enable individual and team fundraising pages with custom goals.',
      collapsible: true,
      collapsibleDefaultOpen: store.isP2P,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: peerToPeerFields,
      disabled: isStatusLocked,
      visibleWhen: () => caps().allowsP2P
    })

    // Matched Giving section - available for standard, p2p, and event campaigns
    const matchedGiving = fieldGroup('matchedGiving', {
      label: 'Matched Giving',
      description:
        'Configure match periods with multipliers, depleting pools, and matcher details.',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: matchedGivingFields,
      disabled: isStatusLocked,
      visibleWhen: () => caps().allowsMatchedGiving
    })

    return {
      donationForms,
      crowdfunding,
      peerToPeer,
      matchedGiving
    }
  })
}
