import type {
  ComposableForm,
  OnChangeContext,
  FieldDef
} from '~/features/_library/form-builder/types'
import { useAddressFields } from '~/features/donation-form/shared/forms/address-form'

import { defineForm } from '~/features/_library/form-builder/api'

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
 * @param enabled - Whether Gift Aid feature is enabled in config (default: true for backward compatibility)
 * @param visibleWhen - Function that determines when fields should be visible (default: GBP currency check)
 * @returns FieldMetaMap object with Gift Aid fields
 *
 * @example
 * ```typescript
 * const fields = {
 *   ...otherFields,
 *   ...createGiftAidFields(true)
 * }
 * ```
 *
 * Requirements:
 * - Parent form must inject `currency` value for visibility check
 * - Parent form must inject `shippingAddress.*` fields if using address reuse feature
 */
export function createGiftAidFields(
  enabled = true,
  visibleWhen?: (ctx: { values: Record<string, unknown> }) => boolean
): Record<string, unknown> {
  // Default visibility: only show for GBP currency (UK donors) AND if enabled
  const defaultVisibility = ({ values }: { values: Record<string, unknown> }) => {
    if (!enabled) return false
    const currency = values.currency as string | undefined
    return currency === 'GBP'
  }

  const shouldShow = visibleWhen || defaultVisibility

  return {
    // Gift Aid Information Card (UK only)
    giftAidInfo: {
      type: 'card',
      label: 'Boost your donations by 25% at no cost to you!',
      class: 'flex gap-8 flex-row-reverse items-center',
      imageSrc: '/imgs/gift-aid.svg',
      imageAlt: 'Gift Aid',
      imageClass: 'h-10 w-auto mb-4 dark:invert',
      content: '',
      showBorder: false,
      visibleWhen: ({ values }: { values: Record<string, unknown> }) => shouldShow({ values })
    },

    // Gift Aid consent toggle
    giftAidConsent: {
      type: 'toggle',
      label:
        'Yes, I am a UK taxpayer and I would like to reclaim the tax on all qualifying donations I have made, as well as any future donations, until I notify them otherwise.',
      description:
        'I understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year it is my responsibility to pay any difference.',
      defaultValue: false,
      optional: true,
      visibleWhen: ({ values }: { values: Record<string, unknown> }) => shouldShow({ values }),
      isSeparatorAfter: true
    },

    // Option to use shipping address (if available)
    useSameAsShipping: {
      type: 'toggle',
      label: 'Home address same as shipping',
      description: ({ values }: { values: Record<string, unknown> }) => {
        // Show truncated shipping address
        const shippingAddress = formatAddress(values, 'shippingAddress')
        return `${shippingAddress}`
      },
      descriptionClass: 'truncate',
      defaultValue: false,
      optional: true,
      visibleWhen: ({ values }: { values: Record<string, unknown> }) => {
        // First check parent visibility
        if (!shouldShow({ values })) return false

        // Show if Gift Aid consent is given AND shipping address exists
        if (values.giftAidConsent !== true) return false

        // Check if shipping address has been collected
        const hasShippingAddress = !!(values['shippingAddress.address1'] as string | undefined)
        return hasShippingAddress
      },
      onChange: ({ value, values, setValue }: OnChangeContext) => {
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
            const shippingValue = values[`shippingAddress.${field}`]
            if (shippingValue !== undefined) {
              setValue(`homeAddress.${field}`, shippingValue)
            }
          })
        }
      },
      isSeparatorAfter: true
    },

    // Home Address Collection (for Gift Aid)
    homeAddress: {
      type: 'field-group',
      label: 'Home Address',
      description:
        'Required by HMRC for Gift Aid claims (UK taxpayers living abroad can use their overseas address)',
      visibleWhen: ({ values }: { values: Record<string, unknown> }) => {
        // First check parent visibility
        if (!shouldShow({ values })) return false

        // Show if Gift Aid consent is given AND not using shipping address
        return values.giftAidConsent === true && values.useSameAsShipping !== true
      },
      fields: useAddressFields()
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
export const useGiftAidFormSection: ComposableForm = defineForm('gift-aid', (_ctx) => {
  //   ctx.title = 'Gift Aid (UK Taxpayers Only)'
  return createGiftAidFields() as Record<string, FieldDef>
})
