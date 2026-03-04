import { defineForm, tabsField, alertField } from '~/features/_library/form-builder/api'
import type { FormContext } from '~/features/_library/form-builder/types'
import { useCrowdfundingSettingsForm } from '~/features/campaigns/features/crowdfunding/admin/forms/crowdfunding-settings-form'
import { useDonationFormDonationAmountsForm } from '~/features/donation-form/admin/forms/donation-form-donation-amounts-form'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

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

    // Currency info alert (same as admin-donation-form-master)
    const currencyStore = useCurrencySettingsStore()
    const currencyInfo = alertField('currencyInfo', {
      variant: 'info',
      label: 'Organization currency settings',
      description: () => {
        const supportedCurrenciesDisplay = currencyStore.supportedCurrencies.join(', ')
        const multipliers = currencyStore.currencyMultipliers
        const multiplierEntries = Object.entries(multipliers)
        const multipliersDisplay =
          multiplierEntries.length === 0
            ? 'All at default (1.0×)'
            : multiplierEntries
                .map(([currency, value]) => `${currency}: ${value.toFixed(2)}×`)
                .join(', ')
        return `Supported: ${supportedCurrenciesDisplay || 'None configured'}\nMultipliers: ${multipliersDisplay}`
      },
      cta: {
        label: 'Edit currency settings',
        to: '/admin/settings/currency#currencies.currencyTabs.multipliers'
      }
    })

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
          fields: {
            currencyInfo,
            ...amountsFields
          }
        }
      ]
    })

    return { sections }
  })
}
