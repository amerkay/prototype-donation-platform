/**
 * Donation form context utility
 * Flattens donation form store data for use as external context in custom fields
 */

import { computed } from 'vue'
import type { ContextSchema } from '~/features/form-builder/conditions'
import { useDonationFormStore } from '~/features/donation-form/stores/donationForm'

/**
 * Recursively flatten nested objects into dot-notation keys
 * @param obj - Object to flatten
 * @param prefix - Current key prefix
 * @returns Flattened object with dot-notation keys
 */
function flattenObject(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey))
    } else {
      // Primitive value or array - add directly
      result[newKey] = value
    }
  }

  return result
}

/**
 * Create flattened context object from donation form store
 * Provides all donation form state in a flat structure for condition evaluation
 */
export function useDonationFormContext() {
  const store = useDonationFormStore()

  /**
   * Flattened context object with all donation form state
   * Used as `context` prop in FormRenderer for custom fields
   */
  const context = computed(() => {
    const ctx: Record<string, unknown> = {
      // Basic form state
      currentStep: store.currentStep,
      activeTab: store.activeTab,
      selectedCurrency: store.selectedCurrency,

      // Donation amounts by frequency
      'donationAmounts.once': store.donationAmounts.once,
      'donationAmounts.monthly': store.donationAmounts.monthly,
      'donationAmounts.yearly': store.donationAmounts.yearly,

      // Selected products
      'selectedProducts.monthly.id': store.selectedProducts.monthly?.id,
      'selectedProducts.monthly.name': store.selectedProducts.monthly?.name,
      'selectedProducts.monthly.price': store.selectedProducts.monthly?.price,
      'selectedProducts.monthly.isShippingRequired':
        store.selectedProducts.monthly?.isShippingRequired,
      'selectedProducts.yearly.id': store.selectedProducts.yearly?.id,
      'selectedProducts.yearly.name': store.selectedProducts.yearly?.name,
      'selectedProducts.yearly.price': store.selectedProducts.yearly?.price,
      'selectedProducts.yearly.isShippingRequired':
        store.selectedProducts.yearly?.isShippingRequired,

      // Tribute data
      'tributeData.once.type': store.tributeData.once?.type,
      'tributeData.monthly.type': store.tributeData.monthly?.type,
      'tributeData.yearly.type': store.tributeData.yearly?.type,

      // Cover costs
      'coverCosts.type': store.coverCosts?.type,
      'coverCosts.value': store.coverCosts?.value,

      // Form sections (recursively flatten all nested objects)
      ...flattenObject(store.formSections.donorInfo || {}, 'donorInfo'),
      ...flattenObject(store.formSections.shipping || {}, 'shipping')
    }

    return ctx
  })

  /**
   * Context schema describing available fields for condition builder
   * Used as `contextSchema` prop in FormRenderer for custom fields
   */
  const contextSchema: ContextSchema = {
    // Basic form state
    currentStep: {
      label: 'Current Step',
      type: 'number',
      description: 'Current step number in the donation flow'
    },
    activeTab: {
      label: 'Active Tab',
      type: 'string',
      description: 'Current donation frequency tab',
      options: [
        { value: 'once', label: 'One-time' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'multiple', label: 'Multiple Products' }
      ]
    },
    selectedCurrency: {
      label: 'Selected Currency',
      type: 'string',
      description: 'Currency code (USD, EUR, GBP, etc.)'
    },

    // Donation amounts
    'donationAmounts.once': {
      label: 'One-time Donation Amount',
      type: 'number',
      description: 'Amount for one-time donation'
    },
    'donationAmounts.monthly': {
      label: 'Monthly Donation Amount',
      type: 'number',
      description: 'Amount for monthly recurring donation'
    },
    'donationAmounts.yearly': {
      label: 'Yearly Donation Amount',
      type: 'number',
      description: 'Amount for yearly recurring donation'
    },

    // Selected products - Monthly
    'selectedProducts.monthly.id': {
      label: 'Monthly Product ID',
      type: 'string',
      description: 'ID of selected monthly product'
    },
    'selectedProducts.monthly.name': {
      label: 'Monthly Product Name',
      type: 'string',
      description: 'Name of selected monthly product'
    },
    'selectedProducts.monthly.price': {
      label: 'Monthly Product Price',
      type: 'number',
      description: 'Price of selected monthly product'
    },
    'selectedProducts.monthly.isShippingRequired': {
      label: 'Monthly Product Needs Shipping',
      type: 'boolean',
      description: 'Whether monthly product requires shipping'
    },

    // Selected products - Yearly
    'selectedProducts.yearly.id': {
      label: 'Yearly Product ID',
      type: 'string',
      description: 'ID of selected yearly product'
    },
    'selectedProducts.yearly.name': {
      label: 'Yearly Product Name',
      type: 'string',
      description: 'Name of selected yearly product'
    },
    'selectedProducts.yearly.price': {
      label: 'Yearly Product Price',
      type: 'number',
      description: 'Price of selected yearly product'
    },
    'selectedProducts.yearly.isShippingRequired': {
      label: 'Yearly Product Needs Shipping',
      type: 'boolean',
      description: 'Whether yearly product requires shipping'
    },

    // Tribute data
    'tributeData.once.type': {
      label: 'One-time Tribute Type',
      type: 'string',
      description: 'Type of tribute for one-time donation',
      options: [
        { value: 'none', label: 'No tribute' },
        { value: 'gift', label: 'Gift' },
        { value: 'memorial', label: 'Memorial' }
      ]
    },
    'tributeData.monthly.type': {
      label: 'Monthly Tribute Type',
      type: 'string',
      description: 'Type of tribute for monthly donation',
      options: [
        { value: 'none', label: 'No tribute' },
        { value: 'gift', label: 'Gift' },
        { value: 'memorial', label: 'Memorial' }
      ]
    },
    'tributeData.yearly.type': {
      label: 'Yearly Tribute Type',
      type: 'string',
      description: 'Type of tribute for yearly donation',
      options: [
        { value: 'none', label: 'No tribute' },
        { value: 'gift', label: 'Gift' },
        { value: 'memorial', label: 'Memorial' }
      ]
    },

    // Cover costs
    'coverCosts.type': {
      label: 'Cover Costs Type',
      type: 'string',
      description: 'Type of cover costs contribution',
      options: [
        { value: 'percentage', label: 'Percentage' },
        { value: 'amount', label: 'Fixed Amount' }
      ]
    },
    'coverCosts.value': {
      label: 'Cover Costs Value',
      type: 'number',
      description: 'Value of cover costs contribution'
    },

    // Donor info fields (common fields)
    'donorInfo.name.firstName': {
      label: 'First Name',
      type: 'string',
      description: 'Donor first name'
    },
    'donorInfo.name.lastName': {
      label: 'Last Name',
      type: 'string',
      description: 'Donor last name'
    },
    'donorInfo.email': {
      label: 'Email',
      type: 'string',
      description: 'Donor email address'
    },
    'donorInfo.phone': {
      label: 'Phone',
      type: 'string',
      description: 'Donor phone number'
    },
    'donorInfo.anonymous': {
      label: 'Donate Anonymously',
      type: 'boolean',
      description: 'Whether donor wants to remain anonymous'
    },
    'donorInfo.includeMessage': {
      label: 'Include Message',
      type: 'boolean',
      description: 'Whether donor wants to include a message'
    },
    'donorInfo.message': {
      label: 'Message',
      type: 'string',
      description: 'Optional message from donor'
    },

    // Shipping address fields
    'shipping.name.firstName': {
      label: 'Shipping First Name',
      type: 'string',
      description: 'Shipping address first name'
    },
    'shipping.name.lastName': {
      label: 'Shipping Last Name',
      type: 'string',
      description: 'Shipping address last name'
    },
    'shipping.address1': {
      label: 'Shipping Address Line 1',
      type: 'string',
      description: 'Shipping address line 1'
    },
    'shipping.address2': {
      label: 'Shipping Address Line 2',
      type: 'string',
      description: 'Shipping address line 2'
    },
    'shipping.city': {
      label: 'Shipping City',
      type: 'string',
      description: 'Shipping city'
    },
    'shipping.regionPostcode.region': {
      label: 'Shipping State/Region',
      type: 'string',
      description: 'Shipping state/province/region'
    },
    'shipping.regionPostcode.postcode': {
      label: 'Shipping Postal Code',
      type: 'string',
      description: 'Shipping postal/zip code'
    },
    'shipping.country': {
      label: 'Shipping Country',
      type: 'string',
      description: 'Shipping country'
    }
  }

  return {
    context,
    contextSchema
  }
}
