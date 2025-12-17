import * as z from 'zod'
import type { ConfigSectionDef } from '~/features/form-builder/form-builder-types'

/**
 * LocationIQ address response type
 */
interface LocationIQAddress {
  name?: string // Street name
  house_number?: string
  road?: string
  suburb?: string
  city?: string
  town?: string
  village?: string
  state?: string
  postcode?: string
  country?: string
  country_code?: string
}

/**
 * Parsed address components ready for form fields
 */
interface ParsedAddress {
  line1: string
  line2: string
  city: string
  county: string
  postcode: string
}

/**
 * Parse LocationIQ address into structured form fields
 * Handles multiple address formats (UK/US/EU styles)
 */
function parseLocationIQAddress(addr: LocationIQAddress): ParsedAddress {
  // Build address line 1 - try multiple fields in order of preference
  // 1. house_number + road (UK/US style: "123 Main Street")
  // 2. name field (when API returns just street name: "Platypus Close")
  // 3. road alone (fallback)
  let line1 = ''
  if (addr.house_number && addr.road) {
    line1 = `${addr.house_number} ${addr.road}`.trim()
  } else if (addr.name) {
    line1 = addr.name.trim()
  } else if (addr.road) {
    line1 = addr.road.trim()
  }

  // Get city - try multiple fields in order of preference
  const city = addr.city || addr.town || addr.village || addr.suburb || ''

  // If we used 'name' field and there's a suburb, put suburb in address2
  const line2 =
    addr.name && !addr.house_number && addr.suburb && addr.suburb !== city ? addr.suburb : ''

  return {
    line1,
    line2,
    city,
    county: addr.state || '',
    postcode: addr.postcode || ''
  }
}

/**
 * Populate form address fields from parsed address data
 * Uses setTimeout to ensure fields are visible before population
 */
function populateAddressFields(
  parsed: ParsedAddress,
  setValue: (field: string, value: unknown) => void
) {
  // Set addressConfirmed FIRST to make fields visible
  setValue('addressConfirmed', true)
  // Hide manual entry toggle after successful autocomplete
  setValue('enterManually', false)

  // Clear all fields first (ensures clean state)
  setValue('address1', '')
  setValue('address2', '')
  setValue('city', '')
  setValue('countyPostcode.county', '')
  setValue('countyPostcode.postcode', '')

  // Small delay to ensure fields are visible before populating
  setTimeout(() => {
    if (parsed.line1) setValue('address1', parsed.line1)
    if (parsed.line2) setValue('address2', parsed.line2)
    if (parsed.city) setValue('city', parsed.city)
    if (parsed.county) setValue('countyPostcode.county', parsed.county)
    if (parsed.postcode) setValue('countyPostcode.postcode', parsed.postcode)
  }, 50)
}

/**
 * Address form section
 * Features LocationIQ autocomplete with progressive disclosure
 * 1. Country selection (prefilled from IP)
 * 2. Address search (typeahead via LocationIQ API)
 * 3. Confirmation preview
 * 4. Editable structured fields
 */
export const addressFormSection: ConfigSectionDef = {
  id: 'address',
  title: 'Address',
  fields: {
    // Country selector - shown first, used to restrict address search
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
      isNoSeparatorAfter: true,
      autocomplete: 'section-shipping shipping country'
    },

    // Address search field with LocationIQ autocomplete
    addressSearch: {
      type: 'autocomplete',
      label: 'Search address',
      placeholder: 'Start typing your street address…',
      searchPlaceholder: 'Search for your address...',
      notFoundText: 'No addresses found. Try a different search.',
      minQueryLength: 3,
      debounceMs: 300,
      autocomplete: 'section-shipping shipping street-address',
      optional: true,
      visibleWhen: (values) => {
        // Show when country is selected and manual entry is not enabled
        return !!values.country && values.enterManually !== true
      },
      fetchOptions: async (query: string, formValues: Record<string, unknown>) => {
        // Get selected country for filtering results
        // The country field value is a ComboboxOption object
        const countryValue = formValues.country as
          | { value: string; label: string }
          | string
          | undefined

        let countryCode = 'gb' // Default fallback

        if (typeof countryValue === 'object' && countryValue?.value) {
          countryCode = String(countryValue.value).toLowerCase()
        } else if (typeof countryValue === 'string') {
          countryCode = countryValue.toLowerCase()
        }

        try {
          const response = await fetch(
            `/api/locationiq/autocomplete?q=${encodeURIComponent(query)}&country=${countryCode}`
          )

          if (!response.ok) {
            console.error('LocationIQ API error:', response.statusText)
            return []
          }

          const results = (await response.json()) as Array<{
            display_place?: string
            display_address?: string
            address?: LocationIQAddress
          }>

          return results.map((item) => ({
            value: item.display_place || item.display_address || '',
            label: item.display_place || '',
            description: item.display_address,
            data: item.address // Full address object for parsing
          }))
        } catch (error) {
          console.error('Error fetching address suggestions:', error)
          return []
        }
      },
      onChange: (value, _allValues, setValue) => {
        const option = value as { data?: LocationIQAddress }
        const addr = option?.data

        if (!addr) return

        const parsed = parseLocationIQAddress(addr)

        // Validate we have minimum required data
        if (!parsed.line1 && !parsed.city) return

        populateAddressFields(parsed, setValue)
      },
      isNoSeparatorAfter: true
    },

    // Manual address entry toggle
    enterManually: {
      type: 'toggle',
      label: 'Enter address manually',
      optional: true,
      visibleWhen: (values) => {
        // Show when country is selected but address not yet confirmed
        return !!values.country && values.addressConfirmed !== true
      },
      isNoSeparatorAfter: true
    },

    // Hidden field to track confirmation state
    addressConfirmed: {
      type: 'toggle',
      label: '',
      optional: true,
      visibleWhen: () => false, // Always hidden
      isNoSeparatorAfter: true
    },

    // Editable address fields (shown after confirmation)
    address1: {
      type: 'text',
      label: 'Address Line 1',
      placeholder: '123 High Street',
      autocomplete: 'section-shipping shipping address-line1',
      visibleWhen: (values) => values.addressConfirmed === true || values.enterManually === true,
      rules: (values) =>
        values.addressConfirmed === true || values.enterManually === true
          ? z.string().min(5, 'Address is required')
          : z.string().optional(),
      isNoSeparatorAfter: true
    },

    address2: {
      type: 'text',
      label: 'Address Line 2',
      placeholder: 'Flat 4B',
      autocomplete: 'section-shipping shipping address-line2',
      optional: true,
      visibleWhen: (values) => {
        if (!values.addressConfirmed && !values.enterManually) return false
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
      autocomplete: 'section-shipping shipping address-level2',
      visibleWhen: (values) => values.addressConfirmed === true || values.enterManually === true,
      rules: (values) =>
        values.addressConfirmed === true || values.enterManually === true
          ? z.string().min(2, 'Town/City is required')
          : z.string().optional(),
      isNoSeparatorAfter: true
    },

    countyPostcode: {
      type: 'field-group',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: (values) => values.addressConfirmed === true || values.enterManually === true,
      isNoSeparatorAfter: true,
      fields: {
        county: {
          type: 'text',
          label: 'County/Region',
          placeholder: 'Greater London',
          autocomplete: 'section-shipping shipping address-level1',
          rules: z.string().min(2, 'County/Region is required')
        },
        postcode: {
          type: 'text',
          label: 'Postcode',
          placeholder: 'SW1A 1AA',
          autocomplete: 'section-shipping shipping postal-code',
          rules: z.string().min(3, 'Postcode is required')
        }
      }
    }
  }
}
