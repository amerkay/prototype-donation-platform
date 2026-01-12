/**
 * Donation form context utility
 * Flattens donation form store data for use as external context in custom fields
 */

import { computed } from 'vue'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'
import { useFormConfigStore } from '~/stores/formConfig'

/**
 * Create flattened context object from donation form store
 * Provides all donation form state in a flat structure for condition evaluation
 */
export function useDonationFormContext() {
  const store = useDonationFormStore()
  const configStore = useFormConfigStore()

  /**
   * Flattened context object with all donation form state
   * Used as `context` prop in FormRenderer for custom fields
   */
  const context = computed(() => {
    return {
      donationFrequency: store.activeTab,
      currency: store.selectedCurrency,
      donationAmount: store.totalDonationAmount,
      needsShipping: store.needsShipping,
      isTribute: store.isTribute,
      'donorInfo.phone': store.formSections.donorInfo?.phone,
      'donorInfo.anonymous': store.formSections.donorInfo?.anonymous,
      'donorInfo.includeMessage': store.formSections.donorInfo?.includeMessage,
      // Step 3 fields
      giftAidConsent: store.formSections.giftAid?.giftAidConsent,
      costCoveragePercentage: store.costCoveragePercentage,
      joinMailingList: store.formSections.emailOptIn?.joinEmailList
    }
  })

  /**
   * Context schema describing available fields for condition builder
   * Used as `contextSchema` prop in FormRenderer for custom fields
   */
  const supportedCurrencies = configStore.fullConfig?.localization.supportedCurrencies || [
    'USD',
    'EUR',
    'GBP'
  ]

  const contextSchema: ContextSchema = {
    donationFrequency: {
      label: 'Donation Frequency',
      type: 'array',
      description: 'Selected donation frequency',
      availableFromStep: 2,
      options: [
        { value: 'once', label: 'One-time' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'multiple', label: 'Multiple Products' }
      ]
    },
    currency: {
      label: 'Currency',
      type: 'array',
      description: 'Selected currency',
      availableFromStep: 2,
      options: supportedCurrencies.map((code) => ({
        value: code,
        label: code
      }))
    },
    donationAmount: {
      label: 'Donation Amount',
      type: 'number',
      description: 'Total donation amount (includes multiple cart items)',
      availableFromStep: 2
    },
    needsShipping: {
      label: 'Needs Shipping',
      type: 'boolean',
      description: 'Whether any selected product requires shipping',
      availableFromStep: 2
    },
    isTribute: {
      label: 'Is Tribute',
      type: 'boolean',
      description: 'Whether donation is a tribute (gift or memorial)',
      availableFromStep: 2
    },
    'donorInfo.phone': {
      label: 'Phone',
      type: 'string',
      description: 'Donor phone number',
      availableFromStep: 2
    },
    'donorInfo.anonymous': {
      label: 'Donate Anonymously',
      type: 'boolean',
      description: 'Whether donor wants to remain anonymous',
      availableFromStep: 2
    },
    'donorInfo.includeMessage': {
      label: 'Include Message',
      type: 'boolean',
      description: 'Whether donor wants to include a message (message becomes required when true)',
      availableFromStep: 2
    },

    // Step 3 fields
    giftAidConsent: {
      label: 'Gift Aid Consent',
      type: 'boolean',
      description: 'Whether donor consented to Gift Aid (UK taxpayers only, Step 3)',
      availableFromStep: 3
    },
    costCoveragePercentage: {
      label: 'Cost Coverage Percentage',
      type: 'number',
      description: 'Percentage of transaction/processing costs donor is covering (0-100, Step 3)',
      availableFromStep: 3
    },
    joinMailingList: {
      label: 'Join Mailing List',
      type: 'boolean',
      description: 'Whether donor wants to join the mailing list (Step 3)',
      availableFromStep: 3
    }
  }

  return {
    context,
    contextSchema
  }
}
