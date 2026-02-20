import * as z from 'zod'
import {
  defineForm,
  comboboxField,
  fieldGroup,
  sliderField,
  cardField,
  componentField,
  tabsField,
  alertField
} from '~/features/_library/form-builder/api'
import type { FieldContext } from '~/features/_library/form-builder/types'
import CurrencyExampleTable from '~/features/settings/admin/components/CurrencyExampleTable.vue'
import { getCurrencyOptionsForSelect } from '~/features/donation-form/shared/composables/useCurrency'

// Get all available currency options from centralized source
const CURRENCY_OPTIONS = getCurrencyOptionsForSelect()

/**
 * Currency settings form configuration
 * Uses tabsField with "Currency Defaults" and "Multipliers" tabs
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
    options: ({ values }: FieldContext) => {
      const supported = (values.supportedCurrencies as string[]) || []
      return CURRENCY_OPTIONS.filter((opt) => supported.includes(opt.value))
    },
    rules: ({ values }: FieldContext) => {
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
      <p>To make things easier for donors, converted amounts are automatically rounded to friendly numbers:</p>
      <p><strong>Under £5:</strong> Rounded to nearest whole number (e.g., £2, £3)<br />
      <strong>£5–£50:</strong> Rounded to nearest £5 (e.g., £10, £15, £20)<br />
      <strong>£50–£200:</strong> Rounded to nearest £25 (e.g., £75, £100)<br />
      <strong>£200–£500:</strong> Rounded to nearest £50 (e.g., £250, £300)<br />
      <strong>Over £500:</strong> Rounded to nearest £100 (e.g., £600, £700)</p>
      <p>This keeps donation amounts clean and easy to understand across all currencies.</p>
    `
  })

  // Create multiplier field groups for each possible currency
  const currencyMultiplierFields: Record<string, ReturnType<typeof fieldGroup>> = {}
  const currencySliderMappings: Record<string, string> = {}

  CURRENCY_OPTIONS.forEach(({ value: currency }) => {
    currencySliderMappings[`currencyTabs.multipliers.${currency}.slider`] =
      `currencyMultipliers.${currency}`

    currencyMultiplierFields[currency] = fieldGroup('', {
      label: ({ root }: FieldContext) => {
        const currencies = root.currencies as Record<string, unknown> | undefined
        const tabs = currencies?.currencyTabs as Record<string, unknown> | undefined
        const multipliers = tabs?.multipliers as Record<string, unknown> | undefined
        const currencyGroup = multipliers?.[currency] as Record<string, unknown> | undefined
        const multiplier = (currencyGroup?.slider as number) ?? 1.0
        return `${currency} multiplier = ${multiplier.toFixed(2)}×${multiplier === 1.0 ? ' (default)' : ''}`
      },
      collapsible: true,
      collapsibleDefaultOpen: false,
      wrapperClass: 'border rounded-lg p-4',
      visibleWhen: ({ root }: FieldContext) => {
        const currencies = root.currencies as Record<string, unknown> | undefined
        const tabs = currencies?.currencyTabs as Record<string, unknown> | undefined
        const defaults = tabs?.defaults as Record<string, unknown> | undefined
        const supported = (defaults?.supportedCurrencies as string[]) || []
        const defaultCurr = (defaults?.defaultCurrency as string) || ''
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
    })
  })

  /** Check if multipliers tab should be enabled (>1 supported currency + default set) */
  const hasMultipleCurrencies = ({ root }: FieldContext) => {
    const currencies = root.currencies as Record<string, unknown> | undefined
    const tabs = currencies?.currencyTabs as Record<string, unknown> | undefined
    const defaults = tabs?.defaults as Record<string, unknown> | undefined
    const supported = (defaults?.supportedCurrencies as string[]) || []
    const defaultCurr = (defaults?.defaultCurrency as string) || ''
    return supported.length > 1 && !!defaultCurr
  }

  /** Count non-default multipliers for badge (empty when tab disabled) */
  const multipliersBadge = (ctx: FieldContext) => {
    if (!hasMultipleCurrencies(ctx)) return ''
    const currencies = ctx.root.currencies as Record<string, unknown> | undefined
    const tabs = currencies?.currencyTabs as Record<string, unknown> | undefined
    const multipliers = tabs?.multipliers as Record<string, unknown> | undefined
    if (!multipliers) return ''
    let count = 0
    for (const key of Object.keys(multipliers)) {
      const group = multipliers[key] as Record<string, unknown> | undefined
      if (!group || typeof group !== 'object' || !('slider' in group)) continue
      const val = group?.slider as number | undefined
      if (val !== undefined && val !== 1.0) count++
    }
    return count > 0 ? `${count} custom` : ''
  }

  const multipliersNotice = alertField('multipliersNotice', {
    variant: 'info',
    description: 'Supported currencies and the default currency are configured on the other tab.',
    cta: {
      label: 'Go to Currency Defaults',
      to: '#currencies.currencyTabs.defaults',
      inline: true
    }
  })

  const currencyTabs = tabsField('currencyTabs', {
    label: 'Currency Configuration',
    tabsListClass: 'w-full',
    defaultValue: 'defaults',
    tabs: [
      {
        value: 'defaults',
        label: 'Currency Defaults',
        fields: { supportedCurrencies, defaultCurrency }
      },
      {
        value: 'multipliers',
        label: 'Multipliers',
        badgeLabel: multipliersBadge,
        badgeVariant: 'secondary',
        disabled: (ctx: FieldContext) => !hasMultipleCurrencies(ctx),
        disabledTooltip: 'Add multiple currencies to enable setting currency multipliers',
        fields: {
          roundingExplanation,
          ...currencyMultiplierFields,
          multipliersNotice
        }
      }
    ]
  })

  const currencies = fieldGroup('currencies', {
    wrapperClass: 'px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border',
    fields: { currencyTabs },
    $storePath: {
      'currencyTabs.defaults.supportedCurrencies': 'supportedCurrencies',
      'currencyTabs.defaults.defaultCurrency': 'defaultCurrency',
      ...currencySliderMappings
    }
  })

  return { currencies }
})
