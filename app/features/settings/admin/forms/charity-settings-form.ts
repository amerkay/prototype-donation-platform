import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  toggleField,
  fieldGroup,
  alertField,
  componentField
} from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import { getCurrencyOptionsForSelect } from '~/features/donation-form/shared/composables/useCurrency'
import { computed, ref } from 'vue'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import {
  useAddressFields,
  ADDRESS_ALL_OR_NOTHING_RULES
} from '~/features/donation-form/shared/forms/address-form'
import ClearAddressButton from '~/features/settings/admin/components/ClearAddressButton.vue'
import { formatCharityAddress } from '~/features/settings/admin/utils/formatCharityAddress'
import type { CharityAddress } from '~/features/settings/admin/types'

const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

function formatAddressSummary(a: Partial<CharityAddress> | undefined): string {
  if (!a) return ''
  return formatCharityAddress(a as CharityAddress)
}

/**
 * Charity settings form configuration
 * Used in organization settings to configure charity identity
 */
export const useCharitySettingsForm = defineForm('charitySettings', () => {
  const currencyStore = useCurrencySettingsStore()
  const charityStore = useCharitySettingsStore()

  // --- Charity identity fields ---

  const charityInfoAlert = alertField('charityInfoAlert', {
    variant: 'info',
    description: () => {
      if (currencyStore.supportedCurrencies.length > 1) {
        return `Shown to donors paying in ${currencyStore.defaultCurrency} (your default currency). For other currencies, use the overrides below.`
      }
      return `Shown to donors paying in ${currencyStore.defaultCurrency} (your default currency).`
    },
    cta: {
      label: 'Change default currency',
      to: '/admin/settings/currency#defaultCurrency',
      inline: true
    }
  })

  const name = textField('name', {
    label: 'Charity Name',
    description: 'Official registered charity name',
    placeholder: 'Borneo Orangutan Survival Foundation',
    rules: z.string().min(3, 'Charity name must be at least 3 characters')
  })

  const registrationNumber = textField('registrationNumber', {
    label: 'Registration Number',
    description: 'Official charity registration number (e.g., RCN123456)',
    placeholder: 'RCN123456',
    rules: z.string().min(3, 'Registration number is required')
  })

  const addressSummary = computed(
    () => formatAddressSummary(charityStore.address) || 'Registered charity address'
  )

  const address = fieldGroup('address', {
    label: 'Address',
    collapsible: true,
    collapsibleDefaultOpen: false,
    description: addressSummary,
    wrapperClass: 'border rounded-lg p-4',
    fields: useAddressFields(),
    showSeparatorAfter: true
  })

  // Per-currency override groups
  const currencyOverrideFields: Record<string, ReturnType<typeof fieldGroup>> = {}
  const currencyOverrideMappings: Record<string, string> = {}

  CURRENCY_OPTIONS.forEach(({ value: currency }) => {
    currencyOverrideMappings[`currencyOverrides.${currency}.enabled`] =
      `currencyOverrides.${currency}.enabled`
    currencyOverrideMappings[`currencyOverrides.${currency}.name`] =
      `currencyOverrides.${currency}.name`
    currencyOverrideMappings[`currencyOverrides.${currency}.registrationNumber`] =
      `currencyOverrides.${currency}.registrationNumber`
    // Structured address mappings for each override
    for (const field of ['address1', 'address2', 'city', 'country'] as const) {
      currencyOverrideMappings[`currencyOverrides.${currency}.address.${field}`] =
        `currencyOverrides.${currency}.address.${field}`
    }
    currencyOverrideMappings[`currencyOverrides.${currency}.address.group1.region`] =
      `currencyOverrides.${currency}.address.region`
    currencyOverrideMappings[`currencyOverrides.${currency}.address.group1.postcode`] =
      `currencyOverrides.${currency}.address.postcode`

    const enabledVisibility = ({ values }: FieldContext) => (values.enabled as boolean) === true

    const overrideAddressSummary = computed(() => {
      const addr = charityStore.currencyOverrides[currency]?.address
      if (!addr) return 'No override address'
      const required = [addr.address1, addr.city, addr.region, addr.postcode, addr.country]
      const filled = required.filter(Boolean).length
      if (filled === 0) return 'No override address'
      const summary = formatAddressSummary(addr)
      if (filled < required.length) return `Incomplete — ${summary}`
      return summary
    })

    const addressAccordionState = ref<string | undefined>(undefined)

    // Spread address fields and remove separator after country
    const addressFields = useAddressFields(undefined, 'shipping', undefined, true)
    if (addressFields.country) {
      addressFields.country = { ...addressFields.country, showSeparatorAfter: false }
    }

    const overrideHasContentRule = z.record(z.any()).refine(
      (d) => {
        if (!d.enabled) return true
        const a = (d.address as Record<string, unknown>) ?? {}
        const g = (a.group1 as Record<string, unknown>) ?? {}
        return [
          d.name,
          d.registrationNumber,
          a.address1,
          a.city,
          a.country,
          g.region,
          g.postcode
        ].some((v) => typeof v === 'string' && v.length > 0)
      },
      { message: 'Override at least one value, or toggle this off' }
    )

    currencyOverrideFields[currency] = fieldGroup('', {
      label: `${currency} Override`,
      collapsible: true,
      collapsibleDefaultOpen: ({ values }: FieldContext) => (values.enabled as boolean) === true,
      wrapperClass: 'border rounded-lg p-4',
      visibleWhen: () => {
        return (
          currencyStore.supportedCurrencies.includes(currency) &&
          currency !== currencyStore.defaultCurrency
        )
      },
      rules: overrideHasContentRule,
      fields: {
        enabled: toggleField('enabled', {
          label: `Use different details for ${currency}`,
          description: `Override charity name, registration, or address for ${currency} transactions`,
          defaultValue: false,
          rules: z.boolean()
        }),
        name: textField('name', {
          label: 'Charity Name',
          placeholder: 'Override charity name',
          visibleWhen: enabledVisibility,
          rules: z.string().optional()
        }),
        registrationNumber: textField('registrationNumber', {
          label: 'Registration Number',
          placeholder: 'Override registration number',
          visibleWhen: enabledVisibility,
          rules: z.string().optional()
        }),
        address: fieldGroup('address', {
          label: 'Address',
          collapsible: true,
          collapsibleDefaultOpen: false,
          collapsibleStateRef: addressAccordionState,
          description: overrideAddressSummary,
          wrapperClass: 'border rounded-lg p-4',
          visibleWhen: enabledVisibility,
          fields: {
            ...addressFields,
            clearAddress: componentField('clearAddress', {
              component: ClearAddressButton,
              props: {
                onClear: () => {
                  addressAccordionState.value = undefined
                }
              },
              visibleWhen: ({ values }: FieldContext) => {
                const g = (values.group1 as Record<string, unknown>) ?? {}
                return [values.address1, values.city, values.country, g.region, g.postcode].some(
                  (v) => typeof v === 'string' && v.length > 0
                )
              }
            })
          },
          rules: ADDRESS_ALL_OR_NOTHING_RULES
        })
      }
    })
  })

  const currencyOverrides = fieldGroup('currencyOverrides', {
    label: 'Currency-Specific Overrides',
    description:
      'Override charity details for specific currencies (e.g., different registration in another jurisdiction).',
    collapsible: false,
    visibleWhen: () => currencyStore.supportedCurrencies.length > 1,
    fields: { ...currencyOverrideFields }
  })

  const charityInfo = fieldGroup('charityInfo', {
    label: 'Charity Information',
    description:
      "Your organization's registered charity identity shown on receipts and donor pages.",
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { charityInfoAlert, name, registrationNumber, address, currencyOverrides },
    $storePath: {
      name: 'name',
      registrationNumber: 'registrationNumber',
      'address.address1': 'address.address1',
      'address.address2': 'address.address2',
      'address.city': 'address.city',
      'address.group1.region': 'address.region',
      'address.group1.postcode': 'address.postcode',
      'address.country': 'address.country',
      ...currencyOverrideMappings
    }
  })

  // --- Organization profile fields ---

  const slug = textField('slug', {
    label: 'Organization Slug',
    description: 'URL-friendly identifier used in donor-facing routes',
    disabled: true,
    rules: z.string().min(1)
  })

  const website = textField('website', {
    label: 'Website URL',
    description: 'Charity website (must start with http:// or https://)',
    placeholder: 'https://example.org',
    rules: z.string().url('Must be a valid URL')
  })

  const description = textareaField('description', {
    label: 'Description',
    description: 'Brief description of the charity (max 275 chars)',
    placeholder: 'We rescue, rehabilitate, and release orangutans...',
    maxLength: 275,
    rows: 3,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
  })

  const orgProfile = fieldGroup('orgProfile', {
    label: 'Organization Profile',
    description: 'Public-facing details about your organization.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { slug, website, description },
    $storePath: {
      slug: 'slug',
      website: 'website',
      description: 'description'
    }
  })

  return { charityInfo, orgProfile }
})
