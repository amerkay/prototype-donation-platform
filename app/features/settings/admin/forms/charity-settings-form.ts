import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  toggleField,
  fieldGroup,
  alertField
} from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import { getCurrencyOptionsForSelect } from '~/features/donation-form/shared/composables/useCurrency'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'

const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

/**
 * Charity settings form configuration
 * Used in organization settings to configure charity identity
 */
export const useCharitySettingsForm = defineForm('charitySettings', () => {
  const currencyStore = useCurrencySettingsStore()

  const slug = textField('slug', {
    label: 'Organization Slug',
    description: 'URL-friendly identifier used in donor-facing routes',
    disabled: true,
    rules: z.string().min(1)
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

  const address = textareaField('address', {
    label: 'Address',
    description: 'Registered charity address',
    placeholder: '123 Conservation Way, City, Country',
    rows: 2,
    rules: z.string().min(5, 'Address is required')
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
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275),
    showSeparatorAfter: true
  })

  // Per-currency override groups
  const currencyOverrideFields: Record<string, ReturnType<typeof fieldGroup>> = {}
  const currencyOverrideMappings: Record<string, string> = {}

  CURRENCY_OPTIONS.forEach(({ value: currency }) => {
    // Map: charityInfo.currencyOverrides.USD.enabled → store.currencyOverrides.USD.enabled
    currencyOverrideMappings[`currencyOverrides.${currency}.enabled`] =
      `currencyOverrides.${currency}.enabled`
    currencyOverrideMappings[`currencyOverrides.${currency}.name`] =
      `currencyOverrides.${currency}.name`
    currencyOverrideMappings[`currencyOverrides.${currency}.registrationNumber`] =
      `currencyOverrides.${currency}.registrationNumber`
    currencyOverrideMappings[`currencyOverrides.${currency}.address`] =
      `currencyOverrides.${currency}.address`

    currencyOverrideFields[currency] = fieldGroup('', {
      label: `${currency} Override`,
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'border rounded-lg p-4',
      visibleWhen: () => {
        return (
          currencyStore.supportedCurrencies.includes(currency) &&
          currency !== currencyStore.defaultCurrency
        )
      },
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
          visibleWhen: ({ values }: FieldContext) => (values.enabled as boolean) === true,
          rules: z.string().optional()
        }),
        registrationNumber: textField('registrationNumber', {
          label: 'Registration Number',
          placeholder: 'Override registration number',
          visibleWhen: ({ values }: FieldContext) => (values.enabled as boolean) === true,
          rules: z.string().optional()
        }),
        address: textareaField('address', {
          label: 'Address',
          placeholder: 'Override address',
          rows: 2,
          visibleWhen: ({ values }: FieldContext) => (values.enabled as boolean) === true,
          rules: z.string().optional()
        })
      }
    })
  })

  const currencyOverrides = fieldGroup('currencyOverrides', {
    label: 'Currency-Specific Overrides',
    description:
      'Override charity details for specific currencies (e.g., different registration in another jurisdiction).',
    collapsible: true,
    visibleWhen: () => {
      return currencyStore.supportedCurrencies.length > 1
    },
    fields: {
      ...currencyOverrideFields
    }
  })

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

  const charityInfo = fieldGroup('charityInfo', {
    label: 'Charity Information',
    description: "Configure your organization's charity identity displayed on donor-facing pages.",
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      charityInfoAlert,
      slug,
      name,
      registrationNumber,
      address,
      website,
      description,
      currencyOverrides
    },
    $storePath: {
      slug: 'slug',
      name: 'name',
      registrationNumber: 'registrationNumber',
      address: 'address',
      website: 'website',
      description: 'description',
      ...currencyOverrideMappings
    }
  })

  return { charityInfo }
})
