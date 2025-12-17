import * as z from 'zod'
import type { ConfigSectionDef, SetFieldValueFn } from '~/features/form-builder/form-builder-types'
import { createAddressFields } from './address-form'

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
  const county = getValue('countyPostcode.county')
  const postcode = getValue('countyPostcode.postcode')

  const parts = [address1, address2, city, county, postcode].filter(Boolean)

  if (parts.length === 0) return 'No address on file'

  // Truncate if too long (keep first 2 and last item)
  if (parts.length > 3) {
    return `${parts[0]}, ${parts[1]}... ${parts[parts.length - 1]}`
  }

  return parts.join(', ')
}

/**
 * Gift Aid consent form section (Step 3)
 *
 * Conditional form for UK donors (GBP currency) with:
 * - Gift Aid information card with logo
 * - Consent toggle
 * - Home address collection (required for Gift Aid)
 * - Option to reuse shipping address if available
 * - Email list opt-in
 * - Terms acceptance (required)
 */
export const giftAidFormSection: ConfigSectionDef = {
  id: 'giftAid',
  title: 'Complete Your Donation',
  description: 'Just a few more details to finalize your contribution',
  fields: {
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
      visibleWhen: (values) => {
        // Only show for GBP currency (UK donors)
        // Access currency from root form context (injected from parent)
        const currency = values.currency as string | undefined
        return currency === 'GBP'
      },
      isNoSeparatorAfter: true
    },

    // Gift Aid consent toggle
    giftAidConsent: {
      type: 'toggle',
      label: 'Yes, I want to Gift Aid my donation',
      description:
        'I am a UK taxpayer and understand that if I pay less Income Tax and/or Capital Gains Tax than the amount of Gift Aid claimed on all my donations in that tax year, it is my responsibility to pay any difference.',
      optional: true,
      visibleWhen: (values) => values.currency === 'GBP',
      isNoSeparatorAfter: true
    },

    // Option to use shipping address (if available)
    useSameAsShipping: {
      type: 'toggle',
      label: 'Use same as shipping address',
      description: (values) => {
        // Show truncated shipping address
        const shippingAddress = formatAddress(values, 'shippingAddress')
        return `Your shipping address: ${shippingAddress}`
      },
      optional: true,
      visibleWhen: (values) => {
        // Only show if Gift Aid consent is given AND shipping address exists
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
            'countyPostcode.county',
            'countyPostcode.postcode'
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
      description: 'Required by HMRC for Gift Aid claims',
      visibleWhen: (values) => {
        // Show if Gift Aid consent is given AND not using shipping address
        return values.giftAidConsent === true && values.useSameAsShipping !== true
      },
      fields: createAddressFields(undefined, 'billing'),
      isNoSeparatorAfter: false
    },

    // Email list opt-in
    joinEmailList: {
      type: 'toggle',
      label: 'Join our email list',
      description:
        'Stay updated with our latest news, impact stories, and opportunities to make a difference. You can unsubscribe at any time.',
      optional: true,
      isNoSeparatorAfter: true
    },

    // Terms acceptance (required)
    acceptTerms: {
      type: 'toggle',
      label: 'I accept the terms and conditions',
      description: (_values) => {
        // Dynamic description with link
        return 'By continuing, you agree to our Terms of Service and Privacy Policy. We will never share your personal information with third parties.'
      },
      rules: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions to continue'
      })
    }
  }
}
