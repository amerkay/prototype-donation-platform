import { computed } from 'vue'
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
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
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

/** Resolve base default currency from root form values (may be in donationAmounts or currencySettings group) */
export function getBaseDefaultCurrencyFromRoot(root: unknown): string {
  const r = root as Record<string, Record<string, unknown> | undefined>
  return (
    (r?.currencySettings?.baseDefaultCurrency as string) ||
    (r?.donationAmounts?.baseDefaultCurrency as string) ||
    'GBP'
  )
}

// Helper to create frequency tab fields (DRY principle)
function createFrequencyTabFields(
  placeholder: string,
  maxPlaceholder: string,
  description: string,
  isFundraiser: boolean,
  /** When true, this is the only frequency — hide the toggle and force enabled */
  isSoleFrequency = false
): Record<string, FieldDef> {
  const isEnabled = ({ values }: FieldContext) =>
    isSoleFrequency || !!(values?.enabled as boolean | undefined)
  const isEnabledAndNotFundraiser = (ctx: FieldContext) => isEnabled(ctx) && !isFundraiser

  return {
    enabled: toggleField('enabled', {
      label: 'Enabled',
      description,
      visibleWhen: () => !isFundraiser && !isSoleFrequency,
      defaultValue: isSoleFrequency ? true : undefined,
      rules: z.boolean()
    }),
    label: textField('label', {
      label: 'Display Label',
      placeholder,
      visibleWhen: isEnabledAndNotFundraiser,
      rules: ({ values }: FieldContext) => {
        const enabled = values.enabled as boolean | undefined
        return enabled ? z.string().min(1, 'Label is required') : z.string()
      }
    }),
    enableAmountDescriptions: toggleField('enableAmountDescriptions', {
      label: 'Add descriptions per amount',
      description: 'Show a description (short text + image) for each preset amount',
      visibleWhen: isEnabledAndNotFundraiser,
      rules: z.boolean().optional()
    }),
    presetAmounts: createPresetAmountsField(),
    customAmount: fieldGroup('customAmount', {
      label: 'Custom Amount Range',
      class: 'grid grid-cols-2 gap-x-3',
      visibleWhen: isEnabledAndNotFundraiser,
      fields: {
        min: currencyField('min', {
          label: 'Minimum',
          placeholder: '1',
          min: 1,
          currencySymbol: ({ root }: FieldContext) =>
            getCurrencySymbol(getBaseDefaultCurrencyFromRoot(root)),
          rules: z.number().min(1, 'Must be at least 1')
        }),
        max: currencyField('max', {
          label: 'Maximum',
          placeholder: maxPlaceholder,
          min: 1,
          currencySymbol: ({ root }: FieldContext) =>
            getCurrencySymbol(getBaseDefaultCurrencyFromRoot(root)),
          rules: z.number().min(1, 'Must be at least 1')
        })
      }
    })
  }
}

/**
 * Donation amounts configuration
 * Handles base currency, frequencies, preset amounts, and custom amount ranges
 *
 * Note: Currency settings (localization) are managed globally in Settings -> Currency
 * Forms inherit global currency settings by default
 */
export const useDonationFormDonationAmountsForm = defineForm('formDonationAmounts', () => {
  // Get currency options from store — reactive computed so options update when org settings change
  const currencyStore = useCurrencySettingsStore()
  const campaignStore = useCampaignConfigStore()
  const formConfigStore = useFormConfigStore()
  const isFundraiser = campaignStore.isFundraiser

  const supportedOptions = computed(() =>
    getCurrencyOptionsForSelect(currencyStore.supportedCurrencies)
  )

  const baseDefaultCurrency = comboboxField('baseDefaultCurrency', {
    label: 'Default / Base Currency',
    description:
      'The default currency shown to donors when they first load the form. This is also the base currency for the preset amounts.',
    placeholder: 'Select base default currency',
    searchPlaceholder: 'Search currencies...',
    options: ({ values }: FieldContext) => {
      const enabled = (values.enabledCurrencies as string[] | undefined) ?? []
      return enabled.length > 0 ? getCurrencyOptionsForSelect(enabled) : supportedOptions.value
    },
    rules: ({ values }: FieldContext) => {
      const supported = currencyStore.supportedCurrencies
      const enabled = (values.enabledCurrencies as string[] | undefined) ?? []
      return z
        .string()
        .min(1, 'Base default currency is required')
        .refine((v) => supported.includes(v), 'Currency not enabled in org settings')
        .refine(
          (v) => enabled.length === 0 || enabled.includes(v),
          'Must be one of the enabled currencies'
        )
    }
  })

  const enabledCurrencies = comboboxField('enabledCurrencies', {
    label: 'Enabled Currencies',
    description: 'Currencies donors can choose from on this form. Defaults to all org currencies.',
    placeholder: 'Select currencies...',
    searchPlaceholder: 'Search currencies...',
    multiple: true,
    defaultValue: currencyStore.supportedCurrencies,
    options: supportedOptions,
    rules: () => {
      const supported = currencyStore.supportedCurrencies
      return z
        .array(z.string())
        .min(1, 'At least one currency is required')
        .refine(
          (vals) => vals.every((v) => supported.includes(v)),
          'Contains currencies not enabled in org settings'
        )
    }
  })

  // Build tabs — fundraisers only see frequencies enabled in their copied form
  const caps = getCampaignCapabilities(campaignStore.type)
  const enabledFreqs = formConfigStore.donationAmounts?.frequencies as
    | Record<string, { enabled?: boolean }>
    | undefined

  // Determine which frequencies will be shown so we can detect sole-frequency case
  const allFreqKeys: string[] = ['once', 'monthly', 'yearly']
  const visibleFrequencies: string[] = isFundraiser
    ? allFreqKeys.filter((f) => enabledFreqs?.[f]?.enabled)
    : !caps.allowsRecurring
      ? ['once']
      : allFreqKeys
  const isSoleFrequency = visibleFrequencies.length === 1

  const allTabs = [
    {
      value: 'once',
      label: 'One-time',
      fields: createFrequencyTabFields(
        'One-time',
        '1000000',
        'Show One-time as an option on the donation form',
        isFundraiser,
        isSoleFrequency && visibleFrequencies.includes('once')
      )
    },
    {
      value: 'monthly',
      label: 'Monthly',
      fields: createFrequencyTabFields(
        'Monthly',
        '1000000',
        'Show Monthly as an option on the donation form',
        isFundraiser,
        isSoleFrequency && visibleFrequencies.includes('monthly')
      )
    },
    {
      value: 'yearly',
      label: 'Yearly',
      fields: createFrequencyTabFields(
        'Yearly',
        '50000',
        'Show Yearly as an option on the donation form',
        isFundraiser,
        isSoleFrequency && visibleFrequencies.includes('yearly')
      )
    }
  ]

  const tabs = isFundraiser
    ? allTabs.filter((t) => enabledFreqs?.[t.value]?.enabled)
    : !caps.allowsRecurring
      ? allTabs.filter((t) => t.value === 'once')
      : allTabs

  const frequencies = tabsField('frequencies', {
    tabsListClass: 'w-full',
    label: !caps.allowsRecurring ? 'Preset Amounts' : 'Donation Frequencies',
    description: !caps.allowsRecurring
      ? 'Configure preset donation amounts'
      : 'Configure available donation frequencies and their preset amounts',
    defaultValue: tabs[0]?.value ?? 'once',
    tabs,
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

  return { baseDefaultCurrency, enabledCurrencies, frequencies }
})
