import * as z from 'zod'
import {
  defineForm,
  comboboxField,
  fieldGroup,
  sliderField,
  cardField,
  componentField
} from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import CurrencyExampleTable from '~/features/settings/admin/components/CurrencyExampleTable.vue'
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

  const defaultCurrency = comboboxField('defaultCurrency', {
    label: 'Default Currency',
    description: "Your organization's base currency. Multipliers are not applied to this currency.",
    placeholder: 'Select default currency',
    searchPlaceholder: 'Search currencies...',
    showSeparatorAfter: true,
    options: ({ values }: FieldContext) => {
      // Access sibling field in same fieldGroup using 'values'
      const supported = (values.supportedCurrencies as string[]) || []
      return CURRENCY_OPTIONS.filter((opt) => supported.includes(opt.value))
    },
    rules: ({ values }: FieldContext) => {
      // Access sibling field in same fieldGroup using 'values'
      const supported = (values.supportedCurrencies as string[]) || []
      return z
        .string()
        .min(1, 'Default currency is required')
        .refine((val) => supported.includes(val), {
          message: 'Default currency must be one of the supported currencies'
        })
    }
  })

  const roundingExplanation = cardField('roundingExplanation', {
    label: 'How Smart Rounding Works',
    content: `
      <div class="text-sm space-y-2">
        <p class="text-muted-foreground">
          To make things easier for donors, converted amounts are automatically rounded to friendly numbers:
        </p>
        <ul class="list-disc pl-6 space-y-1 text-muted-foreground">
          <li><strong>Under £5:</strong> Rounded to nearest whole number (e.g., £2, £3)</li>
          <li><strong>£5-£50:</strong> Rounded to nearest £5 (e.g., £10, £15, £20)</li>
          <li><strong>£50-£200:</strong> Rounded to nearest £25 (e.g., £75, £100)</li>
          <li><strong>£200-£500:</strong> Rounded to nearest £50 (e.g., £250, £300)</li>
          <li><strong>Over £500:</strong> Rounded to nearest £100 (e.g., £600, £700)</li>
        </ul>
        <p class="text-xs text-muted-foreground mt-2">
          This keeps donation amounts clean and easy to understand across all currencies.
        </p>
      </div>
    `
  })

  // Create multiplier field groups for each possible currency
  // These will be shown/hidden based on supportedCurrencies and defaultCurrency
  const currencyMultiplierFields: Record<string, ReturnType<typeof fieldGroup>> = {}

  // Build $storePath mappings for all currency sliders
  const currencySliderMappings: Record<string, string> = {}

  // Create fields for all possible currencies (not just supported ones)
  // This ensures the form structure is stable and fields can be shown/hidden dynamically
  CURRENCY_OPTIONS.forEach(({ value: currency }) => {
    // Add mapping: form.currencies.currencyMultipliers.USD.slider → store.currencyMultipliers.USD
    currencySliderMappings[`currencyMultipliers.${currency}.slider`] =
      `currencyMultipliers.${currency}`

    currencyMultiplierFields[currency] = fieldGroup('', {
      label: ({ root }: FieldContext) => {
        // Access multiplier value from root.currencies.currencyMultipliers[currency].slider
        const currencies = root.currencies as Record<string, unknown> | undefined
        const multipliers = currencies?.currencyMultipliers as Record<string, unknown> | undefined
        const currencyGroup = multipliers?.[currency] as Record<string, unknown> | undefined
        const multiplier = (currencyGroup?.slider as number) ?? 1.0
        return `${currency} multiplier = ${multiplier.toFixed(2)}×${multiplier === 1.0 ? ' (default)' : ''}`
      },
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'border rounded-lg p-4',
      visibleWhen: ({ root }: FieldContext) => {
        // Access root.currencies values (2 levels up)
        const currencies = root.currencies as Record<string, unknown> | undefined
        const supported = (currencies?.supportedCurrencies as string[]) || []
        const defaultCurr = (currencies?.defaultCurrency as string) || ''
        return supported.includes(currency) && currency !== defaultCurr
      },
      fields: {
        slider: sliderField(currency, {
          label: 'Multiplier',
          description: 'Adjust the effective exchange rate (1.0 = standard rate)',
          min: 0.25,
          max: 2.5,
          step: 0.1,
          defaultValue: 1.0,
          formatValue: (value: number) => `${value.toFixed(2)}×`,
          showMinMax: true,
          minMaxFormatter: (value: number) => `${value.toFixed(2)}×`,
          rules: z.number().min(0.25).max(2.5)
        }),
        examples: componentField('examples', {
          component: CurrencyExampleTable,
          props: { toCurrency: currency }
        })
      }
      // No $storePath here - mapping handled by parent currencies fieldGroup
    })
  })

  const currencyMultipliers = fieldGroup('currencyMultipliers', {
    label: 'Currency Multipliers',
    collapsible: true,
    description:
      'To make things easier for donors, currency conversion is enabled for all forms and uses smart rounding with multipliers you can adjust below.',
    // wrapperClass: 'mt-4',
    visibleWhen: ({ values }: FieldContext) => {
      // Access sibling fields in same fieldGroup (currencies)
      const supported = (values.supportedCurrencies as string[]) || []
      const defaultCurr = (values.defaultCurrency as string) || ''
      return supported.length > 1 && !!defaultCurr
    },
    fields: {
      roundingExplanation,
      ...currencyMultiplierFields
    }
    // No $storePath - mapping handled by parent currencies fieldGroup
  })

  const currencies = fieldGroup('currencies', {
    label: 'Currency Configuration',
    description:
      'Configure which currencies are available across your organization and fine-tune conversion rates.',
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: {
      supportedCurrencies,
      defaultCurrency,
      currencyMultipliers
    },
    // Map nested fields to flat store
    $storePath: {
      supportedCurrencies: 'supportedCurrencies',
      defaultCurrency: 'defaultCurrency',
      // Map all currency sliders: currencies.currencyMultipliers.USD.slider → currencyMultipliers.USD
      ...currencySliderMappings
    }
  })

  return { currencies }
})
