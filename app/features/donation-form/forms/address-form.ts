import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * Address form section
 * Collects standard mailing address information
 */
export const addressFormSection: ConfigSectionDef = {
  id: 'address',
  title: 'Address',
  fields: {
    address1: {
      type: 'text',
      label: 'Address Line 1',
      placeholder: '123 High Street',
      isNoSeparatorAfter: true,
      rules: z.string().min(5, 'Address is required')
    },
    address2: {
      type: 'text',
      label: 'Address Line 2',
      placeholder: 'Flat 4B',
      optional: true,
      visibleWhen: (values) => {
        if (!values.address1 || typeof values.address1 !== 'string') return false
        return z.string().min(5).safeParse(values.address1).success
      },
      rules: z.string().optional(),
      isNoSeparatorAfter: true
    },
    city: {
      type: 'text',
      label: 'Town/City',
      placeholder: 'London',
      isNoSeparatorAfter: true,
      rules: z.string().min(2, 'Town/City is required')
    },
    countyPostcode: {
      type: 'field-group',
      class: 'grid grid-cols-2 gap-x-3',
      isNoSeparatorAfter: true,
      fields: {
        county: {
          type: 'text',
          label: 'County/Region',
          placeholder: 'Greater London',
          rules: z.string().min(2, 'County/Region is required')
        },
        postcode: {
          type: 'text',
          label: 'Postcode',
          placeholder: 'SW1A 1AA',
          rules: z.string().min(3, 'Postcode is required')
        }
      }
    },
    country: {
      type: 'select',
      label: 'Country',
      placeholder: 'Select country...',
      options: [
        { value: 'GB', label: 'United Kingdom' },
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
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
