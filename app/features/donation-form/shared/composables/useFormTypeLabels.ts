import { computed } from 'vue'
import {
  FORM_TYPE_DEFAULTS,
  type FormType,
  type FormTypeLabels
} from '~/features/donation-form/shared/types'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'

/**
 * Provides form-type-aware labels and feature support checks.
 * Derives form type from campaign type via getCampaignCapabilities().
 */
export function useFormTypeLabels() {
  const configStore = useFormConfigStore()
  const campaignStore = useCampaignConfigStore()

  const formType = computed<FormType>(() => {
    // Prefer campaign-derived form type; fall back to legacy formType on FormSettings
    if (campaignStore.type) {
      return getCampaignCapabilities(campaignStore.type).formType
    }
    return configStore.form?.formType ?? 'donation'
  })

  const labels = computed<FormTypeLabels>(() => FORM_TYPE_DEFAULTS[formType.value])

  const isDonation = computed(() => formType.value === 'donation')

  /** Check if a feature is supported for the current campaign type */
  function isFeatureSupported(featureKey: string): boolean {
    const caps = getCampaignCapabilities(campaignStore.type)
    const capMap: Record<string, boolean> = {
      donationAmounts: caps.allowsDonationAmounts,
      productSelector: caps.allowsProductSelector,
      impactBoost: caps.allowsImpactBoost !== false,
      tribute: caps.allowsTribute,
      entryFields: caps.allowsEntryFields,
      coverCosts: caps.allowsCoverCosts,
      giftAid: caps.allowsGiftAid,
      contactConsent: true,
      terms: true
    }
    return capMap[featureKey] ?? false
  }

  return { formType, labels, isDonation, isFeatureSupported }
}
