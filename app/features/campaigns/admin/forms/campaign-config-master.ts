import { defineForm, fieldGroup, tabsField } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useP2PSettingsForm } from '~/features/campaigns/features/p2p/admin/forms/p2p-settings-form'
import { useMatchedGivingSettingsForm } from '~/features/campaigns/features/matched-giving/admin/forms/matched-giving-settings-form'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import {
  createDonationFormTabFields,
  TAB_FORM_SETTINGS,
  TAB_AMOUNTS,
  TAB_FEATURES,
  TAB_CUSTOM_FIELDS
} from './donation-form-tab'
import type { ContextSchemaInput } from '~/features/_library/custom-fields/forms/custom-fields-config-form'

// Tab value constants — shared between tab definition and targets
const TAB_DONATION_FORM = 'donationForm' as const
const TAB_CROWDFUNDING = 'crowdfunding' as const
const TAB_MATCHED_GIVING = 'matchedGiving' as const

/** Type-safe field targets for donor components' data-field attributes.
 *  Keys mirror the crowdfunding sub-form fields; values are suffix paths
 *  that resolve via useHashTarget's suffix matching. */
export const CAMPAIGN_FIELD_TARGETS = {
  donationForm: TAB_DONATION_FORM,
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

// Re-export for consumers
export { DONATION_FORM_FIELD_TARGETS } from './donation-form-tab'

const GROUP_FORM = 'form' as const

/**
 * Unified campaign master form — consolidates ALL campaign + form configuration.
 *
 * Top-level tabs:
 *  - Donation Form (with nested sub-tabs: Form Settings, Amounts, Features, Custom Fields)
 *  - Crowdfunding Page / Template Defaults
 *  - Fundraisers (P2P only)
 *  - Matched Giving
 *
 * Campaign type behavior:
 *  - Standard: Donation Form, Crowdfunding Page
 *  - P2P Template: Donation Form, Template Defaults, Fundraisers
 *  - P2P Fundraiser: Crowdfunding Page, Donation Form (amounts only)
 *  - Event: Donation Form, Crowdfunding Page
 *  - Any + Matching: shows Matched Giving tab
 */
export function createCampaignConfigMaster(
  contextSchema: ContextSchemaInput,
  onTabChange?: (tab: string) => void
) {
  return defineForm('campaignConfigMaster', (ctx: FormContext) => {
    const store = useCampaignConfigStore()

    /** Campaign capabilities — determines which tabs are visible */
    const caps = () => getCampaignCapabilities(store.type)

    // Extract fields from each sub-form
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const peerToPeerFields = useP2PSettingsForm.setup(ctx)
    const matchedGivingFields = useMatchedGivingSettingsForm.setup(ctx)
    const donationFormFields = createDonationFormTabFields(ctx, contextSchema)

    // Lock all sections when campaign is in a terminal state
    const isStatusLocked = () => store.status === 'completed' || store.status === 'ended'

    // Determine default tab based on campaign type
    const defaultTab = store.isFundraiser ? TAB_CROWDFUNDING : TAB_DONATION_FORM

    const sections = tabsField('sections', {
      tabsListClass: 'w-full',
      defaultValue: defaultTab,
      onTabChange,
      tabs: [
        {
          value: TAB_DONATION_FORM,
          label: 'Donation Form',
          visibleWhen: () => store.formConfig.formId !== null,
          disabled: isStatusLocked,
          disabledTooltip: 'Campaign is in a terminal state',
          fields: donationFormFields
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

    // $storePath flattens both campaign tabs AND form config tabs to the store
    const config = fieldGroup('config', {
      fields: { sections },
      $storePath: {
        // Campaign tabs → campaign store props
        [`sections.${TAB_CROWDFUNDING}`]: TAB_CROWDFUNDING,
        'sections.peerToPeer': 'peerToPeer',
        [`sections.${TAB_MATCHED_GIVING}`]: TAB_MATCHED_GIVING,

        // Donation Form tab → formConfig.* store paths
        // Form Settings sub-tab
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FORM_SETTINGS}.${GROUP_FORM}`]: `formConfig.${GROUP_FORM}`,
        // Amounts sub-tab
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_AMOUNTS}.baseDefaultCurrency`]:
          'formConfig.donationAmounts.baseDefaultCurrency',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_AMOUNTS}.enabledCurrencies`]:
          'formConfig.donationAmounts.enabledCurrencies',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_AMOUNTS}.frequencies`]:
          'formConfig.donationAmounts.frequencies',
        // Features sub-tab — each feature group flattened
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.impactBoost`]:
          'formConfig.impactBoost',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.impactCart`]:
          'formConfig.impactCart',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.productSelector`]:
          'formConfig.productSelector',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.coverCosts`]:
          'formConfig.coverCosts',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.giftAid`]: 'formConfig.giftAid',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.tribute`]: 'formConfig.tribute',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.entryFields`]:
          'formConfig.entryFields',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.contactConsent`]:
          'formConfig.contactConsent',
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_FEATURES}.terms`]: 'formConfig.terms',
        // Custom Fields sub-tab
        [`sections.${TAB_DONATION_FORM}.formTabs.${TAB_CUSTOM_FIELDS}`]: 'formConfig.customFields'
      }
    })

    return { config }
  })
}
