import * as z from 'zod'
import {
  defineForm,
  textField,
  radioGroupField,
  currencyField,
  comboboxField,
  dateField
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import {
  getCurrencyOptionsForSelect,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import type { CampaignType } from '~/features/campaigns/shared/types'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import type { FieldContext } from '~/features/_library/form-builder/types'

/** Campaign types available in the creation wizard (P2P has its own flow) */
const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'One-time, monthly, or yearly donations' },
  {
    value: 'event',
    label: 'Event',
    description: 'Registration-style forms with entry fields and ticketing'
  }
]

/**
 * Standalone form for campaign creation wizard.
 * Single step with dynamic fields based on campaign type.
 * Not coupled to useCampaignConfigStore — data flows through v-model.
 */
export const useCampaignCreateWizardForm = defineForm('campaignCreate', () => {
  const currencyStore = useCurrencySettingsStore()

  const campaignType = radioGroupField('campaignType', {
    label: 'Campaign Type',
    description: 'Determines available features and donor experience',
    options: CAMPAIGN_TYPE_OPTIONS,
    defaultValue: 'standard',
    class: 'grid grid-cols-2',
    rules: z.string().min(1, 'Campaign type is required')
  })

  const title = textField('title', {
    label: 'Campaign Title',
    description: 'Main headline shown on the crowdfunding page',
    placeholder: 'Help Save Borneo Orangutans',
    rules: z.string().min(5, 'Title must be at least 5 characters')
  })

  const currency = comboboxField('currency', {
    label: 'Campaign Currency',
    description: 'Cannot be changed after creation',
    defaultValue: currencyStore.defaultCurrency,
    searchPlaceholder: 'Search currencies...',
    options: () => getCurrencyOptionsForSelect(currencyStore.supportedCurrencies),
    rules: z.string().min(1, 'Currency is required')
  })

  const goalAmount = currencyField('goalAmount', {
    label: 'Goal Amount',
    description: 'Target fundraising amount (optional)',
    placeholder: '500',
    min: 0,
    currencySymbol: ({ values }: FieldContext) =>
      getCurrencySymbol((values?.currency as string) || currencyStore.defaultCurrency),
    rules: z.number().min(1, 'Goal must be at least 1').optional(),
    visibleWhen: ({ values }: FieldContext) => {
      const type = (values?.campaignType as CampaignType) || 'standard'
      return type !== 'event'
    }
  })

  const endDate = dateField('endDate', {
    label: 'End Date',
    description: 'When the campaign ends',
    visibleWhen: ({ values }: FieldContext) => {
      const type = (values?.campaignType as CampaignType) || 'standard'
      const caps = getCampaignCapabilities(type)
      return caps.endDateMode !== 'none'
    },
    rules: z.string().optional()
  })

  return {
    campaignType,
    title,
    currency,
    goalAmount,
    endDate
  }
})
