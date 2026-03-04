import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import {
  generateFormId,
  generateFormName,
  convertTemplateAmounts
} from '~/features/donation-form/admin/templates'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import type { CampaignType } from '~/features/campaigns/shared/types'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

/**
 * Extracts form-from-template creation logic for reuse across
 * FormCard (campaign edit) and CampaignCreateWizard.
 */
export function useCreateFormFromTemplate() {
  const currencySettings = useCurrencySettingsStore()
  const { smartRound } = useCurrency()
  const { seedProducts } = useProducts()

  function createFormFromTemplate(
    campaignId: string,
    template: DonationFormTemplate,
    existingFormNames: string[],
    /** Override currency (e.g. campaign currency from wizard). Falls back to org default. */
    overrideCurrency?: string,
    /** Campaign type — used to enforce frequency constraints (e.g. disable recurring for P2P) */
    campaignType?: CampaignType
  ) {
    const formId = generateFormId(campaignId, template.metadata.id)
    const formName = generateFormName(template.metadata.name, existingFormNames)
    const targetCurrency = overrideCurrency || currencySettings.defaultCurrency
    const result = template.factory(campaignId, targetCurrency)
    const { config, products } = convertTemplateAmounts(result, (amount) =>
      smartRound(amount, targetCurrency, 'GBP')
    )
    // Populate enabledCurrencies so the field default doesn't trigger dirty-on-open
    config.donationAmounts.enabledCurrencies = currencySettings.supportedCurrencies

    // Enforce frequency constraints based on campaign type capabilities
    if (campaignType && !getCampaignCapabilities(campaignType).allowsRecurring) {
      config.donationAmounts.frequencies.monthly.enabled = false
      config.donationAmounts.frequencies.yearly.enabled = false
    }

    const resolvedProducts = products.length ? seedProducts(products) : []
    return { formId, formName, config, products: resolvedProducts }
  }

  return { createFormFromTemplate }
}
