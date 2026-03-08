import * as z from 'zod'
import { defineForm, toggleField } from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

/**
 * Create Gift Aid config section definition
 * Returns the form configuration for editing Gift Aid settings
 */
export const useGiftAidConfigSection = defineForm('giftAid', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Gift Aid Feature',
    description: 'Show Gift Aid consent for UK donors (GBP currency only)',
    labelClass: 'font-bold',
    showSeparatorAfter: true,
    rules: () => {
      const currencies =
        useCampaignConfigStore().formConfig.donationAmounts?.enabledCurrencies ??
        useCurrencySettingsStore().supportedCurrencies
      const hasGBP = currencies.includes('GBP')
      return z.boolean().refine((val) => !val || hasGBP, {
        message: 'GBP currency must be enabled to use Gift Aid'
      })
    }
  })

  return { enabled }
})
