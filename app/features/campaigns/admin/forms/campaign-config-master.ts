import { defineForm, fieldGroup } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCampaignDonationFormsForm } from '~/features/campaigns/admin/forms/donation-forms-form'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/admin/forms/crowdfunding-settings-form'
import { useP2PSettingsForm } from '~/features/campaigns/admin/forms/p2p-settings-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

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
 * - Standard: All sections visible (Donation Forms, Crowdfunding Page, Fundraisers)
 * - P2P Template: Donation Forms, Template Defaults, Fundraisers
 * - Fundraiser (P2P Child): Crowdfunding Page only (non-collapsible, status in header)
 *
 * Social sharing has been moved to org-level settings (/admin/settings/social-sharing)
 */
export function createCampaignConfigMaster() {
  return defineForm('campaignConfigMaster', (ctx: FormContext) => {
    const store = useCampaignConfigStore()

    // Extract fields from each sub-form by calling their setup functions
    const donationFormsFields = useCampaignDonationFormsForm.setup(ctx)
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const peerToPeerFields = useP2PSettingsForm.setup(ctx)

    // Lock all sections when campaign is completed or archived
    const isStatusLocked = () => store.status === 'completed' || store.status === 'archived'

    // "Donation Forms" section - hidden for fundraiser (forms inherited from template)
    const donationForms = fieldGroup('donationForms', {
      label: 'Donation Forms',
      description: 'Configure donation form assignments for this campaign.',
      collapsible: true,
      collapsibleDefaultOpen: true,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: donationFormsFields,
      disabled: isStatusLocked,
      // Hidden for fundraiser campaigns (forms inherited from template)
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

    const peerToPeer = fieldGroup('peerToPeer', {
      label: 'Fundraisers',
      description: 'Enable individual and team fundraising pages with custom goals.',
      collapsible: true,
      collapsibleDefaultOpen: store.isP2P,
      wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
      fields: peerToPeerFields,
      disabled: isStatusLocked,
      // Hide from standard and fundraiser campaigns (fundraisers can't have sub-fundraisers)
      visibleWhen: () => store.type !== 'standard' && store.type !== 'fundraiser'
    })

    return {
      donationForms,
      crowdfunding,
      peerToPeer
    }
  })
}
