import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Shipping address form section
 * Collects standard mailing address information
 */
export const shippingAddressFormSection: ConfigSectionDef = {
  id: 'shipping-address',
  title: 'Shipping Address',
  fields: {
    address1: {
      type: 'text',
      label: 'Street Address',
      placeholder: '123 Main Street',
      isNoSeparatorAfter: true,
      rules: z.string().min(5, 'Address is required')
    },
    address2: {
      type: 'text',
      label: 'Apartment, suite, etc.',
      placeholder: 'Apt 4B',
      optional: true,
      rules: z.string().optional(),
      isNoSeparatorAfter: true
    },
    cityStatePostal: {
      type: 'field-group',
      // label: 'Location',
      class: 'grid grid-cols-2 gap-x-3',
      isNoSeparatorAfter: true,
      fields: {
        city: {
          type: 'text',
          label: 'City',
          placeholder: 'New York',
          rules: z.string().min(2, 'City is required')
        },
        state: {
          type: 'text',
          label: 'State / Province',
          placeholder: 'NY',
          rules: z.string().min(2, 'State/Province is required')
        }
      }
    },
    postalCountry: {
      type: 'field-group',
      // label: 'Region',
      class: 'grid grid-cols-2 gap-x-3 mb-4',
      fields: {
        postalCode: {
          type: 'text',
          label: 'Postal Code',
          placeholder: '10001',
          rules: z.string().min(3, 'Postal code is required')
        },
        country: {
          type: 'select',
          label: 'Country',
          placeholder: 'Select country...',
          options: [
            { value: 'US', label: 'United States' },
            { value: 'CA', label: 'Canada' },
            { value: 'GB', label: 'United Kingdom' },
            { value: 'AU', label: 'Australia' },
            { value: 'NZ', label: 'New Zealand' },
            { value: 'IE', label: 'Ireland' },
            { value: 'DE', label: 'Germany' },
            { value: 'FR', label: 'France' },
            { value: 'ES', label: 'Spain' },
            { value: 'IT', label: 'Italy' },
            { value: 'NL', label: 'Netherlands' },
            { value: 'BE', label: 'Belgium' },
            { value: 'CH', label: 'Switzerland' },
            { value: 'AT', label: 'Austria' },
            { value: 'SE', label: 'Sweden' },
            { value: 'NO', label: 'Norway' },
            { value: 'DK', label: 'Denmark' },
            { value: 'FI', label: 'Finland' }
          ],
          searchPlaceholder: 'Search countries...',
          notFoundText: 'No country found.',
          rules: z.string().min(1, 'Country is required')
        }
      }
    }
  }
}
