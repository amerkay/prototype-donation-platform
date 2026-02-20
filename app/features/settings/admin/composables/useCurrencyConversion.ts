import type { FrequencySettings } from '~/features/donation-form/shared/types'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'

/**
 * Convert all preset amounts and custom ranges in frequency settings.
 * Shared by org-level currency change and per-form baseDefaultCurrency change.
 */
export function convertFrequencyAmounts(
  frequencies: Record<string, FrequencySettings>,
  fromCurrency: string,
  toCurrency: string,
  convertFn: (amount: number, to: string, from: string) => number
): void {
  for (const freq of Object.values(frequencies)) {
    if (!freq.enabled) continue
    for (const preset of freq.presetAmounts) {
      if (preset.amount > 0) {
        preset.amount = convertFn(preset.amount, toCurrency, fromCurrency)
      }
    }
    if (freq.customAmount) {
      freq.customAmount.min = convertFn(freq.customAmount.min, toCurrency, fromCurrency)
      freq.customAmount.max = convertFn(freq.customAmount.max, toCurrency, fromCurrency)
    }
  }
}

export interface AffectedForm {
  campaignId: string
  campaignName: string
  formId: string
  formName: string
  href: string
  /** Which unsupported currencies this form references */
  removedFromEnabled: string[]
  /** True if baseDefaultCurrency is being removed/changed */
  defaultCurrencyAffected: boolean
  /** Preview of baseDefaultCurrency conversion (if applicable) */
  conversionExample?: string
}

export interface CurrencyChangePreview {
  /** Products with prices to convert (only when default currency changes) */
  productCount: number
  /** Campaigns with goals to convert (only when default currency changes) */
  campaignCount: number
  /** Forms affected by currency removal or default currency change */
  affectedForms: AffectedForm[]
  /** Price conversion examples */
  examples: Array<{ label: string; from: string; to: string }>
}

export interface ConversionResult {
  products: number
  forms: number
  campaigns: number
}

/**
 * Composable for handling currency changes: default currency conversion and
 * removal of unsupported currencies from forms
 */
export function useCurrencyConversion() {
  const { convertPrice, getCurrencySymbol } = useCurrency()
  const { products, updateProduct } = useProducts()
  const { campaigns, updateCampaign } = useCampaigns()
  const formsStore = useFormsStore()

  /**
   * Preview all impacts of currency settings changes
   */
  function previewChanges(
    oldDefault: string,
    newDefault: string,
    oldSupported: string[],
    newSupported: string[]
  ): CurrencyChangePreview {
    const defaultChanged = oldDefault !== newDefault
    const removedCurrencies = new Set(oldSupported.filter((c) => !newSupported.includes(c)))
    const symbol = getCurrencySymbol
    const examples: CurrencyChangePreview['examples'] = []

    // Products (only affected by default currency change)
    let productCount = 0
    if (defaultChanged) {
      for (const p of products.value) {
        if (p.price != null || p.minPrice != null || p.default != null) {
          productCount++
          if (examples.length < 3 && p.price != null) {
            examples.push({
              label: p.name,
              from: `${symbol(oldDefault)}${p.price}`,
              to: `${symbol(newDefault)}${convertPrice(p.price, newDefault, oldDefault)}`
            })
          }
        }
      }
    }

    // Campaign goals (only affected by default currency change)
    let campaignCount = 0
    if (defaultChanged) {
      for (const c of campaigns.value) {
        if (c.crowdfunding?.goalAmount != null && c.crowdfunding.goalAmount > 0) {
          campaignCount++
          if (examples.length < 3) {
            examples.push({
              label: `${c.name} goal`,
              from: `${symbol(oldDefault)}${c.crowdfunding.goalAmount}`,
              to: `${symbol(newDefault)}${convertPrice(c.crowdfunding.goalAmount, newDefault, oldDefault)}`
            })
          }
        }
      }
    }

    // Forms: affected by currency removal OR default currency change
    const affectedForms: AffectedForm[] = []
    for (const campaign of campaigns.value) {
      const forms = formsStore.getForms(campaign.id)
      for (const form of forms) {
        const da = form.config?.donationAmounts
        if (!da) continue

        const removedFromEnabled = (da.enabledCurrencies ?? []).filter((c) =>
          removedCurrencies.has(c)
        )
        const defaultCurrencyAffected =
          removedCurrencies.has(da.baseDefaultCurrency) ||
          (defaultChanged && da.baseDefaultCurrency === oldDefault)

        if (removedFromEnabled.length === 0 && !defaultCurrencyAffected) continue

        let conversionExample: string | undefined
        if (defaultCurrencyAffected) {
          // Find a sample preset amount for preview
          for (const freq of Object.values(da.frequencies)) {
            if (freq.enabled && freq.presetAmounts.length > 0) {
              const amt = freq.presetAmounts[0]!.amount
              conversionExample = `${symbol(da.baseDefaultCurrency)}${amt} → ${symbol(newDefault)}${convertPrice(amt, newDefault, da.baseDefaultCurrency)}`
              break
            }
          }
        }

        affectedForms.push({
          campaignId: campaign.id,
          campaignName: campaign.name,
          formId: form.id,
          formName: form.name,
          href: `/admin/campaigns/${campaign.id}/forms/${form.id}/edit`,
          removedFromEnabled,
          defaultCurrencyAffected,
          conversionExample
        })
      }
    }

    return { productCount, campaignCount, affectedForms, examples }
  }

  /**
   * Apply all currency changes: convert prices and clean up removed currencies
   */
  async function applyChanges(
    oldDefault: string,
    newDefault: string,
    newSupported: string[]
  ): Promise<ConversionResult> {
    const defaultChanged = oldDefault !== newDefault
    const newSupportedSet = new Set(newSupported)
    let productCount = 0
    let formCount = 0
    let campaignCount = 0

    // Convert products (only when default changed)
    if (defaultChanged) {
      for (const p of products.value) {
        const updates: Record<string, number | undefined> = {}
        if (p.price != null) updates.price = convertPrice(p.price, newDefault, oldDefault)
        if (p.minPrice != null) updates.minPrice = convertPrice(p.minPrice, newDefault, oldDefault)
        if (p.default != null) updates.default = convertPrice(p.default, newDefault, oldDefault)
        if (Object.keys(updates).length > 0) {
          updateProduct(p.id, updates)
          productCount++
        }
      }
    }

    // Fix forms: convert presets if baseDefaultCurrency affected, prune enabledCurrencies
    for (const campaign of campaigns.value) {
      const forms = formsStore.getForms(campaign.id)
      for (const form of forms) {
        const da = form.config?.donationAmounts
        if (!da) continue
        let changed = false

        // Prune unsupported currencies from enabledCurrencies
        if (da.enabledCurrencies) {
          const pruned = da.enabledCurrencies.filter((c) => newSupportedSet.has(c))
          if (pruned.length !== da.enabledCurrencies.length) {
            da.enabledCurrencies = pruned.length > 0 ? pruned : [...newSupported]
            changed = true
          }
        }

        // Convert presets if baseDefaultCurrency needs switching
        const needsConversion =
          !newSupportedSet.has(da.baseDefaultCurrency) ||
          (defaultChanged && da.baseDefaultCurrency === oldDefault)

        if (needsConversion) {
          const fromCurrency = da.baseDefaultCurrency
          convertFrequencyAmounts(da.frequencies, fromCurrency, newDefault, convertPrice)
          da.baseDefaultCurrency = newDefault
          changed = true
        }

        if (changed) {
          formsStore.updateFormConfig(campaign.id, form.id, form.config, form.products)
          formCount++
        }
      }
    }

    // Convert campaign goals (only when default changed)
    if (defaultChanged) {
      for (const c of campaigns.value) {
        if (c.crowdfunding?.goalAmount != null && c.crowdfunding.goalAmount > 0) {
          const newGoal = convertPrice(c.crowdfunding.goalAmount, newDefault, oldDefault)
          await updateCampaign(c.id, {
            crowdfunding: { ...c.crowdfunding, goalAmount: newGoal }
          })
          campaignCount++
        }
      }
    }

    return { products: productCount, forms: formCount, campaigns: campaignCount }
  }

  return { previewChanges, applyChanges }
}
