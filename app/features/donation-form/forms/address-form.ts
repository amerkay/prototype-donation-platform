import * as z from 'zod'
import type { ConfigSectionDef, FieldMetaMap } from '~/features/form-builder/form-builder-types'

/**
 * Create reusable address fields with optional visibility condition
 *
 * Provides a complete address collection form with:
 * - Country selection
 * - Structured address fields (address1, address2, city, county, postcode)
 *
 * Note: This function uses relative paths throughout. When used inside a field-group,
 * the form-builder automatically handles path prefixing via context injection.
 *
 * @param visibilityCondition - Optional function to control when address fields are visible
 * @param autocompleteSection - HTML autocomplete section attribute (default: 'shipping')
 * @param forcedCountry - Optional country code to pre-set and hide the country selector (e.g., 'GB' for UK-only forms)
 * @returns FieldMetaMap with all address fields
 *
 * @example
 * ```typescript
 * // Basic usage
 * const fields = {
 *   ...createAddressFields()
 * }
 *
 * // Inside a field-group (automatic prefix handling)
 * const fields = {
 *   homeAddress: {
 *     type: 'field-group',
 *     fields: createAddressFields()
 *   }
 * }
 *
 * // With visibility condition
 * const fields = {
 *   ...createAddressFields((values) => values.needsAddress === true)
 * }
 *
 * // Force UK only (e.g., for Gift Aid)
 * const fields = {
 *   ...createAddressFields(undefined, 'billing', 'GB')
 * }
 * ```
 */
export function createAddressFields(
  visibilityCondition?: (values: Record<string, unknown>) => boolean,
  autocompleteSection = 'shipping',
  forcedCountry?: string
): FieldMetaMap {
  return {
    country: {
      type: 'select',
      label: 'Country',
      placeholder: 'Select country...',
      searchPlaceholder: 'Search countries...',
      notFoundText: 'No country found.',
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
      isNoSeparatorAfter: true,
      autocomplete: `section-${autocompleteSection} ${autocompleteSection} country`,
      visibleWhen: visibilityCondition
    },

    address1: {
      type: 'text',
      label: 'Address Line 1',
      placeholder: '123 High Street',
      autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-line1`,
      visibleWhen: visibilityCondition,
      rules: z.string().min(5, 'Address is required'),
      isNoSeparatorAfter: true
    },

    address2: {
      type: 'text',
      label: 'Address Line 2',
      placeholder: 'Flat 4B',
      autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-line2`,
      optional: true,
      visibleWhen: (values) => {
        if (visibilityCondition && !visibilityCondition(values)) return false

        if (!values['address1'] || typeof values['address1'] !== 'string') return false
        return z.string().min(5).safeParse(values['address1']).success
      },
      rules: z.string().optional(),
      isNoSeparatorAfter: true
    },

    city: {
      type: 'text',
      label: 'City/Town',
      placeholder: 'London',
      autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-level2`,
      visibleWhen: visibilityCondition,
      rules: z.string().min(2, 'Town/City is required'),
      isNoSeparatorAfter: true
    },

    countyPostcode: {
      type: 'field-group',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: visibilityCondition,
      isNoSeparatorAfter: true,
      fields: {
        county: {
          type: 'text',
          label: 'Region/State',
          placeholder: 'Greater London',
          autocomplete: `section-${autocompleteSection} ${autocompleteSection} address-level1`,
          rules: z.string().min(2, 'County/Region is required')
        },
        postcode: {
          type: 'text',
          label: 'Postcode',
          placeholder: 'SW1A 1AA',
          autocomplete: `section-${autocompleteSection} ${autocompleteSection} postal-code`,
          rules: z.string().min(3, 'Postcode is required')
        }
      }
    }
  }
}

/**
 * Address form section
 * Features structured address fields:
 * 1. Country selection
 * 2. Address lines (1 & 2)
 * 3. Town/City
 * 4. County/Region and Postcode
 */
export const addressFormSection: ConfigSectionDef = {
  id: 'address',
  title: 'Address',
  fields: createAddressFields()
}
