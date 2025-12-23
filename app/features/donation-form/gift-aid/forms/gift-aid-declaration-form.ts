import type {
  FormDef,
  FieldMetaMap,
  SetFieldValueFn
} from '~/features/form-builder/form-builder-types'
import { createAddressFields } from '../../forms/address-form'

/**
 * Helper to format address for display
 * Note: Expects values to be either scoped to a specific address group or with explicit path
 */
function formatAddress(values: Record<string, unknown>, fieldPath = ''): string {
  const getValue = (field: string) => {
    const path = fieldPath ? `${fieldPath}.${field}` : field
    return values[path] as string | undefined
  }

  const address1 = getValue('address1')
  const address2 = getValue('address2')
  const city = getValue('city')
  const region = getValue('regionPostcode.region')
  const postcode = getValue('regionPostcode.postcode')

  const parts = [address1, address2, city, region, postcode].filter(Boolean)

  if (parts.length === 0) return 'No address on file'

  return parts.join(', ')
}

/**
 * Create reusable Gift Aid fields
 *
 * Provides Gift Aid consent flow for UK donors (GBP currency) with:
 * - Gift Aid information card with logo
 * - Consent toggle
 * - Home address collection (required for Gift Aid)
 * - Option to reuse shipping address if available
 *
 * @param visibleWhen - Function that determines when fields should be visible (default: GBP currency check)
 * @returns FieldMetaMap object with Gift Aid fields
 *
 * @example
 * ```typescript
 * const fields = {
 *   ...otherFields,
 *   ...createGiftAidFields()
 * }
 * ```
 *
 * Requirements:
 * - Parent form must inject `currency` value for visibility check
 * - Parent form must inject `shippingAddress.*` fields if using address reuse feature
 */
export function createGiftAidFields(
  visibleWhen?: (values: Record<string, unknown>) => boolean
): FieldMetaMap {
  // Default visibility: only show for GBP currency (UK donors)
  const defaultVisibility = (values: Record<string, unknown>) => {
    const currency = values.currency as string | undefined
    return currency === 'GBP'
  }

  const shouldShow = visibleWhen || defaultVisibility

  return {
    // Gift Aid Information Card (UK only)
    giftAidInfo: {
      type: 'card',
      label: 'Boost Your Donation by 25% at No Cost to You',
      imageSrc: '/imgs/gift-aid.svg',
      imageAlt: 'Gift Aid',
      imageClass: 'h-16 w-auto mb-4 dark:invert',
      content: `
        <p class="mb-3">
          Gift Aid is a UK tax incentive that enables us to reclaim 25p for every £1 you donate 
          at no extra cost to you. This means your donation can go even further in supporting our work.
        </p>
        <p class="mb-3">
          <strong>To qualify, you must:</strong>
        </p>
        <ul class="list-disc list-inside space-y-1 mb-3 text-sm">
          <li>Be a UK taxpayer</li>
          <li>Have paid at least as much Income Tax or Capital Gains Tax as we will reclaim</li>
          <li>Provide your home address (required by HMRC)</li>
        </ul>
        <p class="text-xs text-muted-foreground">
          Please note: If you pay less Income Tax and/or Capital Gains Tax than the amount of 
          Gift Aid claimed on all your donations in that tax year, it is your responsibility to 
          pay any difference.
        </p>
      `,
      visibleWhen: shouldShow,
      isNoSeparatorAfter: true
    },

    // Gift Aid consent toggle
    giftAidConsent: {
      type: 'toggle',
      label: 'Yes, I want to Gift Aid my donation',
      description:
        'I confirm I am a UK taxpayer and have paid sufficient tax to cover this Gift Aid claim.',
      optional: true,
      visibleWhen: shouldShow,
      isNoSeparatorAfter: true
    },

    // Option to use shipping address (if available)
    useSameAsShipping: {
      type: 'toggle',
      label: 'Home address same as shipping',
      description: (values) => {
        // Show truncated shipping address
        const shippingAddress = formatAddress(values, 'shippingAddress')
        return `${shippingAddress}`
      },
      descriptionClass: 'truncate',
      optional: true,
      visibleWhen: (values) => {
        // First check parent visibility
        if (!shouldShow(values)) return false

        // Show if Gift Aid consent is given AND shipping address exists
        if (values.giftAidConsent !== true) return false

        // Check if shipping address has been collected
        const hasShippingAddress = !!(values['shippingAddress.address1'] as string | undefined)
        return hasShippingAddress
      },
      onChange: (value, allValues, setValue: SetFieldValueFn) => {
        // If toggled on, copy shipping address to homeAddress
        if (value === true) {
          // List of address fields to copy
          const fieldsToCopy = [
            'country',
            'addressSearch',
            'enterManually',
            'addressConfirmed',
            'address1',
            'address2',
            'city',
            'regionPostcode.region',
            'regionPostcode.postcode'
          ]

          // Copy each field from shippingAddress to homeAddress
          fieldsToCopy.forEach((field) => {
            const shippingValue = allValues[`shippingAddress.${field}`]
            if (shippingValue !== undefined) {
              setValue(`homeAddress.${field}`, shippingValue)
            }
          })
        }
      },
      isNoSeparatorAfter: true
    },

    // Home Address Collection (for Gift Aid)
    homeAddress: {
      type: 'field-group',
      label: 'Home Address',
      description:
        'Required by HMRC for Gift Aid claims (UK taxpayers living abroad can use their overseas address)',
      visibleWhen: (values) => {
        // First check parent visibility
        if (!shouldShow(values)) return false

        // Show if Gift Aid consent is given AND not using shipping address
        return values.giftAidConsent === true && values.useSameAsShipping !== true
      },
      fields: createAddressFields(undefined, 'shipping'),
      isNoSeparatorAfter: true
    }
  }
}

/**
 * Gift Aid form section
 *
 * Collects Gift Aid consent and home address for UK donors (GBP currency only).
 * Includes option to reuse shipping address if available.
 *
 * Features:
 * - Gift Aid information card with eligibility requirements
 * - Consent toggle
 * - Home address collection (required by HMRC)
 * - Option to copy from shipping address
 */
export const giftAidFormSection: FormDef = {
  id: 'gift-aid',
  //   title: 'Gift Aid (UK Taxpayers Only)',
  fields: createGiftAidFields()
}
