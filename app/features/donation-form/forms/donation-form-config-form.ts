import * as z from 'zod'
import {
  defineForm,
  textField,
  comboboxField,
  fieldGroup,
  toggleField,
  tabsField,
  arrayField,
  currencyField
} from '~/features/form-builder/api'
import type { FieldContext, OnChangeContext, FieldDef } from '~/features/form-builder/types'

// Stub currency data
const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' }
]

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    NZD: 'NZ$'
  }
  return symbols[currency] || '$'
}

// Zod schema for frequency validation
const frequencySchema = z
  .object({
    enabled: z.boolean(),
    label: z.string(),
    presetAmounts: z.array(z.number()),
    customAmount: z.object({
      min: z.number().min(1),
      max: z.number().min(1)
    })
  })
  .superRefine((val, ctx) => {
    if (!val.enabled) return

    if (!val.label.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Label is required',
        path: ['label']
      })
    }

    if (!val.presetAmounts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one preset required',
        path: ['presetAmounts']
      })
    }

    val.presetAmounts.forEach((amount, idx) => {
      if (amount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be at least 1',
          path: ['presetAmounts', idx]
        })
      }
    })
  })

// Helper to create frequency tab fields (DRY principle)
function createFrequencyTabFields(
  placeholder: string,
  maxPlaceholder: string,
  description: string
): Record<string, FieldDef> {
  return {
    enabled: toggleField('enabled', {
      label: 'Enabled',
      description,
      rules: z.boolean()
    }),
    label: textField('label', {
      label: 'Display Label',
      placeholder,
      visibleWhen: ({ values }: FieldContext) => !!(values?.enabled as boolean | undefined),
      rules: ({ values }: FieldContext) => {
        const enabled = values.enabled as boolean | undefined
        return enabled ? z.string().min(1, 'Label is required') : z.string()
      }
    }),
    presetAmounts: arrayField('presetAmounts', {
      label: 'Preset Amounts',
      description: 'Preset donation amounts (in base currency)',
      visibleWhen: ({ values }: FieldContext) => !!(values?.enabled as boolean | undefined),
      class: 'grid grid-cols-1 gap-2 items-start sm:grid-cols-2',
      sortable: true,
      itemField: currencyField('', {
        placeholder: '25',
        min: 1,
        currencySymbol: ({ values }: FieldContext) => {
          const pricing = (values as Record<string, unknown>).pricing as
            | Record<string, unknown>
            | undefined
          const baseCurrency = (pricing?.baseCurrency as string) || 'GBP'
          return getCurrencySymbol(baseCurrency)
        },
        rules: ({ values }: FieldContext) => {
          const minAmount = (values.customAmount as Record<string, unknown> | undefined)?.min as
            | number
            | undefined
          const effectiveMin = minAmount ?? 1
          return z
            .number({ message: 'Amount is required' })
            .min(effectiveMin, `Must be at least ${effectiveMin}`)
        }
      }),
      addButtonText: 'Add Amount',
      rules: ({ values }: FieldContext) => {
        const enabled = values.enabled as boolean | undefined
        return enabled
          ? z.array(z.number().min(1)).min(1, 'At least one preset required')
          : z.array(z.number())
      }
    }),
    customAmount: fieldGroup('customAmount', {
      label: 'Custom Amount Range',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: ({ values }: FieldContext) => !!(values?.enabled as boolean | undefined),
      fields: {
        min: currencyField('min', {
          label: 'Minimum',
          placeholder: '1',
          min: 1,
          currencySymbol: ({ values }: FieldContext) => {
            const pricing = (values as Record<string, unknown>).pricing as
              | Record<string, unknown>
              | undefined
            const baseCurrency = (pricing?.baseCurrency as string) || 'GBP'
            return getCurrencySymbol(baseCurrency)
          },
          rules: z.number().min(1, 'Must be at least 1')
        }),
        max: currencyField('max', {
          label: 'Maximum',
          placeholder: maxPlaceholder,
          min: 1,
          currencySymbol: ({ values }: FieldContext) => {
            const pricing = (values as Record<string, unknown>).pricing as
              | Record<string, unknown>
              | undefined
            const baseCurrency = (pricing?.baseCurrency as string) || 'GBP'
            return getCurrencySymbol(baseCurrency)
          },
          rules: z.number().min(1, 'Must be at least 1')
        })
      }
    })
  }
}

/**
 * Donation form configuration composable
 * Returns the form configuration for editing form, localization, and pricing settings
 */
export const useDonationFormConfigForm = defineForm('form', (ctx) => {
  ctx.title = 'Form Settings'
  ctx.description = 'Configure form title, currencies, and pricing'

  // Basic Settings fields
  const formTitle = textField('title', {
    label: 'Form Title',
    placeholder: 'Enter form title',
    rules: z.string().min(5, 'Title is required')
  })

  const formSubtitle = textField('subtitle', {
    label: 'Form Subtitle',
    placeholder: 'Enter form subtitle',
    optional: true
  })

  const form = fieldGroup('form', {
    label: 'Basic Settings',
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { title: formTitle, subtitle: formSubtitle }
  })

  const branding = fieldGroup('branding', {
    label: 'Branding',
    collapsible: true,
    collapsibleDefaultOpen: false,
    badgeLabel: 'On my TODO list',
    badgeVariant: 'secondary',
    isDisabled: true,
    isSeparatorAfter: true,
    fields: {}
  })

  // Currency Settings fields
  const supportedCurrencies = comboboxField('supportedCurrencies', {
    label: 'Supported Currencies',
    description: 'Currencies available for donors to choose from (select multiple)',
    placeholder: 'Select currencies',
    searchPlaceholder: 'Search currencies...',
    multiple: true,
    options: [...CURRENCY_OPTIONS],
    rules: z.array(z.string()).min(1, 'At least one currency must be supported'),
    onChange: ({ value, values, setValue }: OnChangeContext) => {
      const defaultCurrency = values.defaultCurrency as string | undefined
      const baseCurrency = (values.pricing as Record<string, unknown> | undefined)?.baseCurrency as
        | string
        | undefined
      const supportedCurrencies = (value as string[]).filter(Boolean)

      if (supportedCurrencies.length > 0) {
        if (!defaultCurrency || !supportedCurrencies.includes(defaultCurrency)) {
          setValue('localization.defaultCurrency', supportedCurrencies[0])
        }
        if (baseCurrency && !supportedCurrencies.includes(baseCurrency)) {
          setValue('pricing.baseCurrency', supportedCurrencies[0])
        }
      } else {
        setValue('localization.defaultCurrency', '')
      }
    }
  })

  const defaultCurrency = comboboxField('defaultCurrency', {
    label: 'Default Currency',
    description:
      'The default currency shown when users first load the donation form (choose from supported currencies above)',
    placeholder: 'Select default currency',
    searchPlaceholder: 'Search currencies...',
    options: ({ values }: FieldContext) => {
      const supportedCurrencies = (values.supportedCurrencies as string[]) || []
      return CURRENCY_OPTIONS.filter((opt) => supportedCurrencies.includes(opt.value))
    },
    rules: z.string().min(1, 'Default currency is required')
  })

  const localization = fieldGroup('localization', {
    label: 'Currency Settings',
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { supportedCurrencies, defaultCurrency }
  })

  // Pricing Configuration fields
  const baseCurrency = comboboxField('baseCurrency', {
    label: 'Base Currency',
    description:
      'The currency used for internal calculations and product pricing (choose from supported currencies above)',
    placeholder: 'Select base currency',
    searchPlaceholder: 'Search currencies...',
    options: ({ values }: FieldContext) => {
      const supportedCurrencies =
        ((values.localization as Record<string, unknown> | undefined)
          ?.supportedCurrencies as string[]) || []
      return CURRENCY_OPTIONS.filter((opt) => supportedCurrencies.includes(opt.value))
    },
    rules: z.string().min(1, 'Base currency is required')
  })

  const frequencies = tabsField('frequencies', {
    tabsListClass: 'w-full',
    label: 'Donation Frequencies',
    description: 'Configure available donation frequencies and their preset amounts',
    defaultValue: 'once',
    tabs: [
      {
        value: 'once',
        label: 'One-time',
        fields: createFrequencyTabFields(
          'One-time',
          '1000000',
          'Show One-time as an option on the donation form'
        )
      },
      {
        value: 'monthly',
        label: 'Monthly',
        fields: createFrequencyTabFields(
          'Monthly',
          '1000000',
          'Show Monthly as an option on the donation form'
        )
      },
      {
        value: 'yearly',
        label: 'Yearly',
        fields: createFrequencyTabFields(
          'Yearly',
          '50000',
          'Show Yearly as an option on the donation form'
        )
      }
    ],
    rules: z
      .object({
        once: frequencySchema,
        monthly: frequencySchema,
        yearly: frequencySchema
      })
      .refine((val) => val.once.enabled || val.monthly.enabled || val.yearly.enabled, {
        message: 'Enable at least one donation frequency'
      })
  })

  const pricing = fieldGroup('pricing', {
    label: 'Pricing Configuration',
    collapsible: true,
    collapsibleDefaultOpen: false,
    isSeparatorAfter: true,
    fields: { baseCurrency, frequencies }
  })

  return {
    form,
    branding,
    localization,
    pricing
  }
})
