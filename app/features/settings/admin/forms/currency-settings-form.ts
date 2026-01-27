import * as z from 'zod'
import { defineForm, comboboxField, fieldGroup } from '~/features/_library/form-builder/api'
import { getCurrencyOptionsForSelect } from '~/features/donation-form/shared/composables/useCurrency'

// Get all available currency options from centralized source
const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

/**
 * Currency settings form configuration
 * Used in organization settings to configure default currencies
 */
export const useCurrencySettingsForm = defineForm('currencySettings', () => {
  const supportedCurrencies = comboboxField('supportedCurrencies', {
    label: 'Supported Currencies',
    description: 'Currencies available for donors across all donation forms',
    placeholder: 'Select currencies',
    searchPlaceholder: 'Search currencies...',
    multiple: true,
    options: [...CURRENCY_OPTIONS],
    rules: z.array(z.string()).min(1, 'At least one currency must be supported')
  })

  const currencies = fieldGroup('currencies', {
    label: 'Currency Configuration',
    description:
      'Configure which currencies are available across your organization. Each form will specify its own default currency.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { supportedCurrencies }
  })

  return { currencies }
})
