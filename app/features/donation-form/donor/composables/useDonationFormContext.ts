/**
 * Donation form context utility
 * Flattens donation form store data for use as external context in custom fields
 */

import { computed } from 'vue'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'

/** Infer context schema type from a field's type + whether it has options */
function schemaType(type: string, hasOptions: boolean): 'string' | 'number' | 'boolean' | 'array' {
  if (type === 'number') return 'number'
  if (type === 'checkbox' && !hasOptions) return 'boolean'
  if (type === 'select' || type === 'radio-group' || (type === 'checkbox' && hasOptions))
    return 'array'
  return 'string'
}

/**
 * Build context schema entries for entry fields.
 * Accepts either CustomFieldDefinition[] or raw form value objects.
 */
export function buildEntryFieldSchemaEntries(
  fields: Array<{ type: string; id: string; label: string; options?: string[] }>
): ContextSchema {
  const schema: ContextSchema = {}
  for (const f of fields) {
    const hasOpts = Array.isArray(f.options) && f.options.length > 0
    const type = schemaType(f.type, hasOpts)
    schema[`entry.${f.id}`] = {
      label: `Entry: ${f.label}`,
      type,
      description: `Entry field "${f.label}" value`,
      availableFromStep: 2,
      ...(type === 'array' && hasOpts
        ? {
            options: f.options!.map((o) => ({
              value: o.toLowerCase().replace(/\s+/g, '-'),
              label: o
            }))
          }
        : {})
    }
  }
  return schema
}

/**
 * Build base context schema (everything except entry fields).
 * Shared between donor-side computed and admin-side resolver.
 */
export function buildBaseContextSchema(
  currencies: string[],
  products: Array<{ id: string; name: string }>
): ContextSchema {
  return {
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
      options: currencies.map((code) => ({ value: code, label: code }))
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
    },
    cartProducts: {
      label: 'Cart Has Product',
      type: 'array',
      description: 'Products currently in donor cart (all frequencies)',
      availableFromStep: 2,
      options: products.map((p) => ({ value: p.id, label: p.name }))
    }
  }
}

/**
 * Create flattened context object from donation form store.
 * Provides all donation form state in a flat structure for condition evaluation.
 */
export function useDonationFormContext() {
  const store = useDonationFormStore()
  const formConfigStore = useFormConfigStore()
  const cartStore = useImpactCartStore()
  const { effectiveCurrencies } = useDonationCurrencies()

  /** Flattened context for FormRenderer's `context` prop */
  const context = computed(() => {
    const base: Record<string, unknown> = {
      donationFrequency: store.activeTab,
      currency: store.selectedCurrency,
      donationAmount: store.totalDonationAmount,
      needsShipping: store.needsShipping,
      isTribute: store.isTribute,
      'donorInfo.phone': store.formSections.donorInfo?.phone,
      'donorInfo.anonymous': store.formSections.donorInfo?.anonymous,
      'donorInfo.includeMessage': store.formSections.donorInfo?.includeMessage,
      giftAidConsent: store.formSections.giftAid?.giftAidConsent,
      costCoveragePercentage: store.costCoveragePercentage,
      joinMailingList: store.formSections.emailOptIn?.joinEmailList,
      cartProducts: [
        ...new Set([
          ...cartStore.multipleCart.map((item) => item.id),
          ...(store.selectedProducts.monthly ? [store.selectedProducts.monthly.id] : []),
          ...(store.selectedProducts.yearly ? [store.selectedProducts.yearly.id] : [])
        ])
      ]
    }

    // Spread entry field values with 'entry.' prefix
    const entryValues = store.formSections.entryFields ?? {}
    for (const [key, value] of Object.entries(entryValues)) {
      base[`entry.${key}`] = value
    }

    return base
  })

  /** Context schema for donor-side (reads entry fields from saved config) */
  const contextSchema = computed<ContextSchema>(() => {
    const currencies = effectiveCurrencies.value.supportedCurrencies
    const products = formConfigStore.products.map((p) => ({ id: p.id, name: p.title }))
    const schema = buildBaseContextSchema(currencies, products)

    const entryFields = formConfigStore.entryFields?.fields ?? []
    Object.assign(
      schema,
      buildEntryFieldSchemaEntries(
        entryFields.map((f) => ({
          type: f.type,
          id: f.id,
          label: f.label,
          options: 'options' in f ? (f.options as string[]) : undefined
        }))
      )
    )

    return schema
  })

  return { context, contextSchema }
}
