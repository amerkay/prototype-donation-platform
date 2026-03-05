import { defineForm, tabsField } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useDonationFormDonationAmountsForm } from '~/features/donation-form/admin/forms/donation-form-donation-amounts-form'

/**
 * Unified fundraiser config form — single tab bar with:
 *  - Crowdfunding Page (from campaignConfigStore)
 *  - Donation Amounts (from formConfigStore)
 *
 * Uses manual getData/setData in CampaignMasterConfigPanel to bind to two stores.
 */
export function createFundraiserConfigMaster() {
  return defineForm('fundraiserConfigMaster', (ctx: FormContext) => {
    const crowdfundingFields = useCrowdfundingSettingsForm.setup(ctx)
    const amountsFields = useDonationFormDonationAmountsForm.setup(ctx)

    const sections = tabsField('sections', {
      tabsListClass: 'w-full',
      defaultValue: 'crowdfunding',
      tabs: [
        {
          value: 'crowdfunding',
          label: 'Crowdfunding Page',
          fields: crowdfundingFields
        },
        {
          value: 'amounts',
          label: 'Donation Amounts',
          fields: amountsFields
        }
      ]
    })

    return { sections }
  })
}
