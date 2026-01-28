import * as z from 'zod'
import {
  defineForm,
  textField,
  comboboxField,
  fieldGroup,
  toggleField,
  tabsField,
  currencyField
} from '~/features/_library/form-builder/api'
import type { FieldContext, FieldDef } from '~/features/_library/form-builder/types'
import {
  getCurrencyOptionsForSelect,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { createPresetAmountsField } from './preset-amounts-field'

// Zod schema for frequency validation
const frequencySchema = z
  .object({
    enabled: z.boolean(),
    label: z.string(),
    enableAmountDescriptions: z.boolean().optional(),
    presetAmounts: z.array(
      z.object({
        amount: z.number(),
        shortText: z.string().nullish(),
        image: z.string().nullish()
      })
    ),
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

    // Validate amounts and conditional description requirements
    val.presetAmounts.forEach((preset, idx) => {
      if (preset.amount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be at least 1',
          path: ['presetAmounts', idx, 'amount']
        })
      }

      // If descriptions are enabled, validate description fields
      if (val.enableAmountDescriptions) {
        if (!preset.shortText || !preset.shortText.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Description is required',
            path: ['presetAmounts', idx, 'shortText']
          })
        } else if (preset.shortText.length > 30) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Max 30 characters',
            path: ['presetAmounts', idx, 'shortText']
          })
        }
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
    enableAmountDescriptions: toggleField('enableAmountDescriptions', {
      label: 'Add descriptions per amount',
      description: 'Show a description (short text + image) for each preset amount',
      visibleWhen: ({ values }: FieldContext) => !!(values?.enabled as boolean | undefined),
      rules: z.boolean().optional()
    }),
    presetAmounts: createPresetAmountsField(),
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
            const baseDefaultCurrency = (pricing?.baseDefaultCurrency as string) || 'GBP'
            return getCurrencySymbol(baseDefaultCurrency)
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
            const baseDefaultCurrency = (pricing?.baseDefaultCurrency as string) || 'GBP'
            return getCurrencySymbol(baseDefaultCurrency)
          },
          rules: z.number().min(1, 'Must be at least 1')
        })
      }
    })
  }
}

/**
 * Donation form pricing configuration
 * Handles base currency, frequencies, preset amounts, and custom amount ranges
 *
 * Note: Currency settings (localization) are managed globally in Settings -> Currency
 * Forms inherit global currency settings by default
 */
export const useDonationFormPricingForm = defineForm('formPricing', () => {
  // Get currency options from store (reactive - updates when settings change)
  const currencyStore = useCurrencySettingsStore()
  const CURRENCY_OPTIONS = getCurrencyOptionsForSelect(currencyStore.supportedCurrencies)

  const baseDefaultCurrency = comboboxField('baseDefaultCurrency', {
    label: 'Default / Base Currency',
    description:
      'The default currency shown to donors when they first load the form. This is also the base currency for the preset amounts.',
    placeholder: 'Select base default currency',
    searchPlaceholder: 'Search currencies...',
    options: [...CURRENCY_OPTIONS],
    rules: z.string().min(1, 'Base default currency is required')
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

  return { baseDefaultCurrency, frequencies }
})
