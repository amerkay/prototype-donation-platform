import { defineForm, fieldGroup, tabsField } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCampaignDonationFormsForm } from '~/features/campaigns/admin/forms/donation-forms-form'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useP2PSettingsForm } from '~/features/campaigns/features/p2p/admin/forms/p2p-settings-form'
import { useMatchedGivingSettingsForm } from '~/features/campaigns/features/matched-giving/admin/forms/matched-giving-settings-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

// Tab value constants — shared between tab definition and targets
const TAB_DONATION_FORMS = 'donationForms' as const
const TAB_CROWDFUNDING = 'crowdfunding' as const
const TAB_MATCHED_GIVING = 'matchedGiving' as const

/** Type-safe field targets for donor components' data-field attributes.
 *  Keys mirror the crowdfunding sub-form fields; values are suffix paths
 *  that resolve via useHashTarget's suffix matching. */
export const CAMPAIGN_FIELD_TARGETS = {
  donationForms: TAB_DONATION_FORMS,
  crowdfunding: {
    coverPhoto: `${TAB_CROWDFUNDING}.coverPhoto`,
    title: `${TAB_CROWDFUNDING}.title`,
    shortDescription: `${TAB_CROWDFUNDING}.shortDescription`,
    goalAmount: `${TAB_CROWDFUNDING}.goalAmount`,
    showRecentDonations: `${TAB_CROWDFUNDING}.showRecentDonations`,
    story: `${TAB_CROWDFUNDING}.story`,
    charityNotice: `${TAB_CROWDFUNDING}.charityNotice`,
    enableSocialSharing: `${TAB_CROWDFUNDING}.enableSocialSharing`
  },
  matchedGiving: TAB_MATCHED_GIVING
} as const

/**
 * Master admin form that consolidates all campaign configuration sections.
 * Uses top-level tabs for navigation (Donation Forms, Crowdfunding, Fundraisers, Matched Giving).
 *
 * Campaign type behavior:
 * - Standard: Donation Forms, Crowdfunding Page
 * - P2P Template: Donation Forms, Template Defaults, Fundraisers
 * - P2P Fundraiser: Crowdfunding Page only (other tabs disabled)
 * - Standard/P2P/Event + Matching: shows Matched Giving tab when caps().allowsMatchedGiving
 * - Event: Donation Forms, Crowdfunding Page
 */
export function createCampaignConfigMaster() {
  return defineForm('campaignConfigMaster', (ctx: FormContext) => {
    const store = useCampaignConfigStore()

    /** Campaign capabilities — determines which tabs are visible */
    const caps = () => getCampaignCapabilities(store.type)

    // Extract fields from each sub-form by calling their setup functions
    const donationFormsFields = useCampaignDonationFormsForm.setup(ctx)
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const peerToPeerFields = useP2PSettingsForm.setup(ctx)
    const matchedGivingFields = useMatchedGivingSettingsForm.setup(ctx)

    // Lock all sections when campaign is in a terminal state
    const isStatusLocked = () => store.status === 'completed' || store.status === 'ended'

    // Determine default tab based on campaign type
    const defaultTab = store.isFundraiser ? TAB_CROWDFUNDING : TAB_DONATION_FORMS

    const sections = tabsField('sections', {
      tabsListClass: 'w-full',
      defaultValue: defaultTab,
      tabs: [
        {
          value: TAB_DONATION_FORMS,
          label: 'Donation Forms',
          contentClass: '',
          visibleWhen: () => !store.isFundraiser,
          disabled: isStatusLocked,
          disabledTooltip: 'Campaign is in a terminal state',
          fields: donationFormsFields
        },
        {
          value: TAB_CROWDFUNDING,
          label: () => (store.isP2P ? 'Template Defaults' : 'Crowdfunding Page'),
          disabled: isStatusLocked,
          disabledTooltip: 'Campaign is in a terminal state',
          fields: crowdfundingFields
        },
        {
          value: 'peerToPeer',
          label: 'Fundraisers',
          visibleWhen: () => caps().allowsP2P && !store.isFundraiser,
          disabled: isStatusLocked,
          disabledTooltip: 'Campaign is in a terminal state',
          fields: peerToPeerFields
        },
        {
          value: TAB_MATCHED_GIVING,
          label: 'Matched Giving',
          visibleWhen: () => caps().allowsMatchedGiving && !store.isFundraiser,
          disabled: isStatusLocked,
          disabledTooltip: 'Campaign is in a terminal state',
          fields: matchedGivingFields
        }
      ]
    })

    // Wrap in fieldGroup with $storePath to flatten tab nesting to store structure
    const config = fieldGroup('config', {
      fields: { sections },
      $storePath: {
        [`sections.${TAB_DONATION_FORMS}`]: TAB_DONATION_FORMS,
        [`sections.${TAB_CROWDFUNDING}`]: TAB_CROWDFUNDING,
        'sections.peerToPeer': 'peerToPeer',
        [`sections.${TAB_MATCHED_GIVING}`]: TAB_MATCHED_GIVING
      }
    })

    return { config }
  })
}
