import type { Campaign } from '~/features/campaigns/shared/types'
import type { useFormsStore } from '~/features/campaigns/shared/stores/forms'

export interface AffectedForm {
  campaignName: string
  formName: string
  href: string
}

export interface CurrencyGuardResult {
  defaultBlocked: AffectedForm[]
  enabledOnly: AffectedForm[]
  enabledOnlyIds: Array<{ campaignId: string; formId: string }>
}

/**
 * Two-tier currency removal check.
 * Excludes fundraiser campaigns (they inherit from parent templates).
 * Tier 1: forms where removed currency is baseDefaultCurrency → BLOCK
 * Tier 2: forms where removed currency is only in enabledCurrencies → CONFIRM batch strip
 * // SUPABASE_MIGRATION: server-side check before allowing currency removal
 */
export function findFormsUsingCurrencies(
  removedCurrencies: Set<string>,
  campaigns: Campaign[],
  formsStore: ReturnType<typeof useFormsStore>
): CurrencyGuardResult {
  const defaultBlocked: AffectedForm[] = []
  const enabledOnly: AffectedForm[] = []
  const enabledOnlyIds: Array<{ campaignId: string; formId: string }> = []

  for (const campaign of campaigns) {
    // Skip fundraiser campaigns — they inherit from parent templates
    if (campaign.type === 'fundraiser') continue

    const forms = formsStore.getForms(campaign.id)
    for (const form of forms) {
      const da = form.config?.donationAmounts
      if (!da) continue

      const isDefault = removedCurrencies.has(da.baseDefaultCurrency)
      const isEnabled = (da.enabledCurrencies ?? []).some((c) => removedCurrencies.has(c))

      if (isDefault) {
        defaultBlocked.push({
          campaignName: campaign.name,
          formName: form.name,
          href: `/admin/campaigns/${campaign.id}/forms/${form.id}/edit#baseDefaultCurrency`
        })
      } else if (isEnabled) {
        enabledOnly.push({
          campaignName: campaign.name,
          formName: form.name,
          href: `/admin/campaigns/${campaign.id}/forms/${form.id}/edit#baseDefaultCurrency`
        })
        enabledOnlyIds.push({ campaignId: campaign.id, formId: form.id })
      }
    }
  }

  return { defaultBlocked, enabledOnly, enabledOnlyIds }
}

/**
 * Strip currencies from enabledCurrencies on affected forms.
 * // SUPABASE_MIGRATION: batch update via API
 */
export function stripCurrenciesFromForms(
  currencies: string[],
  formIds: Array<{ campaignId: string; formId: string }>,
  formsStore: ReturnType<typeof useFormsStore>
): void {
  const currencySet = new Set(currencies)
  for (const { campaignId, formId } of formIds) {
    const forms = formsStore.getForms(campaignId)
    const form = forms.find((f) => f.id === formId)
    if (!form?.config?.donationAmounts) continue

    form.config.donationAmounts.enabledCurrencies = (
      form.config.donationAmounts.enabledCurrencies ?? []
    ).filter((c) => !currencySet.has(c))

    formsStore.updateFormConfig(campaignId, formId, form.config, form.products)
  }
}
