import type { Campaign } from '~/features/campaigns/shared/types'

export interface AffectedForm {
  campaignName: string
  formName: string
  href: string
}

export interface CurrencyGuardResult {
  defaultBlocked: AffectedForm[]
  enabledOnly: AffectedForm[]
  enabledOnlyIds: Array<{ campaignId: string }>
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
  campaigns: Campaign[]
): CurrencyGuardResult {
  const defaultBlocked: AffectedForm[] = []
  const enabledOnly: AffectedForm[] = []
  const enabledOnlyIds: Array<{ campaignId: string }> = []

  for (const campaign of campaigns) {
    // Skip fundraiser campaigns — they inherit from parent templates
    if (campaign.type === 'p2p-fundraiser') continue

    const form = campaign.form
    if (!form) continue

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
      enabledOnlyIds.push({ campaignId: campaign.id })
    }
  }

  return { defaultBlocked, enabledOnly, enabledOnlyIds }
}

/**
 * Strip currencies from enabledCurrencies on affected campaign forms.
 * // SUPABASE_MIGRATION: batch update via API
 */
export function stripCurrenciesFromForms(
  currencies: string[],
  formIds: Array<{ campaignId: string }>,
  campaigns: Campaign[]
): void {
  const currencySet = new Set(currencies)
  for (const { campaignId } of formIds) {
    const campaign = campaigns.find((c) => c.id === campaignId)
    const form = campaign?.form
    if (!form?.config?.donationAmounts) continue

    form.config.donationAmounts.enabledCurrencies = (
      form.config.donationAmounts.enabledCurrencies ?? []
    ).filter((c) => !currencySet.has(c))
  }
}
