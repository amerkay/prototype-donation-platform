import * as z from 'zod'
import {
  defineForm,
  textField,
  selectField,
  fieldGroup
} from '~/features/_library/form-builder/api'
import type { VisibilityFn, FieldDef, FieldContext } from '~/features/_library/form-builder/types'

/**
 * Country-specific label configuration
 */
const countryLabels: Record<
  string,
  { region: string; postcode: string; regionPlaceholder: string; postcodePlaceholder: string }
> = {
  US: {
    region: 'State',
    postcode: 'ZIP Code',
    regionPlaceholder: 'California',
    postcodePlaceholder: '90210'
  },
  CA: {
    region: 'Province',
    postcode: 'Postal Code',
    regionPlaceholder: 'Ontario',
    postcodePlaceholder: 'K1A 0B1'
  },
  AU: {
    region: 'State',
    postcode: 'Postcode',
    regionPlaceholder: 'New South Wales',
    postcodePlaceholder: '2000'
  },
  NZ: {
    region: 'Region',
    postcode: 'Postcode',
    regionPlaceholder: 'Auckland',
    postcodePlaceholder: '1010'
  },
  GB: {
    region: 'County',
    postcode: 'Postcode',
    regionPlaceholder: 'Greater London',
    postcodePlaceholder: 'SW1A 1AA'
  },
  IE: {
    region: 'County',
    postcode: 'Eircode',
    regionPlaceholder: 'Dublin',
    postcodePlaceholder: 'D02 XY45'
  },
  DE: {
    region: 'State',
    postcode: 'Postal Code',
    regionPlaceholder: 'Bavaria',
    postcodePlaceholder: '80331'
  },
  FR: {
    region: 'Region',
    postcode: 'Postal Code',
    regionPlaceholder: 'Île-de-France',
    postcodePlaceholder: '75001'
  },
  ES: {
    region: 'Province',
    postcode: 'Postal Code',
    regionPlaceholder: 'Madrid',
    postcodePlaceholder: '28001'
  },
  IT: {
    region: 'Province',
    postcode: 'Postal Code',
    regionPlaceholder: 'Rome',
    postcodePlaceholder: '00100'
  },
  NL: {
    region: 'Province',
    postcode: 'Postal Code',
    regionPlaceholder: 'North Holland',
    postcodePlaceholder: '1012 AB'
  },
  BE: {
    region: 'Province',
    postcode: 'Postal Code',
    regionPlaceholder: 'Brussels',
    postcodePlaceholder: '1000'
  },
  CH: {
    region: 'Canton',
    postcode: 'Postal Code',
    regionPlaceholder: 'Zurich',
    postcodePlaceholder: '8001'
  },
  AT: {
    region: 'State',
    postcode: 'Postal Code',
    regionPlaceholder: 'Vienna',
    postcodePlaceholder: '1010'
  },
  SE: {
    region: 'County',
    postcode: 'Postal Code',
    regionPlaceholder: 'Stockholm',
    postcodePlaceholder: '111 22'
  },
  NO: {
    region: 'County',
    postcode: 'Postal Code',
    regionPlaceholder: 'Oslo',
    postcodePlaceholder: '0150'
  },
  DK: {
    region: 'Region',
    postcode: 'Postal Code',
    regionPlaceholder: 'Capital Region',
    postcodePlaceholder: '1000'
  },
  FI: {
    region: 'Region',
    postcode: 'Postal Code',
    regionPlaceholder: 'Uusimaa',
    postcodePlaceholder: '00100'
  }
}

const defaultLabels = {
  region: 'Region/State',
  postcode: 'Postcode',
  regionPlaceholder: 'Region',
  postcodePlaceholder: 'Postal Code'
}

/**
 * Get country-specific labels for region and postcode fields
 */
function getCountryLabels(country: string | undefined) {
  return country && countryLabels[country] ? countryLabels[country] : defaultLabels
}

/**
 * Create reusable address fields with optional visibility condition
 *
 * Provides a complete address collection form with:
 * - Country selection
 * - Structured address fields (address1, address2, city, region, postcode)
 *
 * Note: This function uses relative paths throughout. When used inside a field-group,
 * the form-builder automatically handles path prefixing via context injection.
 *
 * @param visibleWhen - Optional function to control when address fields are visible
 * @param autocompleteSection - HTML autocomplete section attribute (default: 'shipping')
 * @param forcedCountry - Optional country code to pre-set and hide the country selector (e.g., 'GB' for UK-only forms)
 * @returns Object with all address field definitions
 *
 * @example
 * ```typescript
 * // Basic usage
 * const addressFields = useAddressFields()
 * return { ...addressFields }
 *
 * // Inside a field-group
 * const homeAddress = fieldGroup('homeAddress', {
 *   fields: useAddressFields()
 * })
 *
 * // With visibility condition
 * const addressFields = useAddressFields(({ values }) => values.needsAddress === true)
 *
 * // Force UK only (e.g., for Gift Aid)
 * const addressFields = useAddressFields(undefined, 'billing', 'GB')
 * ```
 */
export function useAddressFields(
  visibleWhen?: VisibilityFn,
  autocompleteSection = 'shipping',
  forcedCountry?: string
): Record<string, FieldDef> {
  const address1 = textField('address1', {
    label: 'Address Line 1',
    placeholder: '123 High Street',
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-line1`,
    defaultValue: '',
    visibleWhen,
    rules: z.string().min(5, 'Address is required')
  })

  const address2 = textField('address2', {
    label: 'Address Line 2',
    placeholder: 'Flat 4B',
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-line2`,
    defaultValue: '',
    optional: true,
    rules: z.string().optional()
  })

  const city = textField('city', {
    label: 'City/Town',
    placeholder: 'London',
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-level2`,
    defaultValue: '',
    visibleWhen,
    rules: z.string().min(2, 'Town/City is required')
  })

  const region = textField('region', {
    label: (ctx: FieldContext) => {
      const country = ctx.values.country as string | undefined
      return getCountryLabels(country).region
    },
    placeholder: (ctx: FieldContext) => {
      const country = ctx.values.country as string | undefined
      return getCountryLabels(country).regionPlaceholder
    },
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-level1`,
    defaultValue: '',
    rules: z.string().min(2, 'State/Region is required')
  })

  const postcode = textField('postcode', {
    label: (ctx: FieldContext) => {
      const country = ctx.values.country as string | undefined
      return getCountryLabels(country).postcode
    },
    placeholder: (ctx: FieldContext) => {
      const country = ctx.values.country as string | undefined
      return getCountryLabels(country).postcodePlaceholder
    },
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} postal-code`,
    defaultValue: '',
    rules: z.string().min(3, 'Postcode is required')
  })

  const group1 = fieldGroup('group1', {
    class: 'grid grid-cols-2 gap-x-3',
    visibleWhen,
    fields: { region, postcode }
  })

  const country = selectField('country', {
    label: 'Country',
    placeholder: 'Select country...',
    searchPlaceholder: 'Search countries...',
    notFoundText: 'No country found.',
    defaultValue: forcedCountry || '',
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
    rules: z.string().min(1, 'Country is required'),
    disabled: !!forcedCountry,
    autocomplete: `section-${autocompleteSection} ${autocompleteSection} country`,
    visibleWhen,
    isSeparatorAfter: true
  })

  return { address1, address2, city, group1, country }
}

/**
 * Address form section
 * Features structured address fields:
 * 1. Country selection
 * 2. Address lines (1 & 2)
 * 3. Town/City
 * 4. County/Region and Postcode
 */
export const useAddressForm = defineForm('address', (ctx) => {
  ctx.title = 'Address'

  return useAddressFields()
})
