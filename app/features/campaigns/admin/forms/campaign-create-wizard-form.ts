import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  currencyField,
  comboboxField,
  selectField,
  dateField
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import {
  getCurrencyOptionsForSelect,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import type { CampaignType, P2PPreset } from '~/features/campaigns/shared/types'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import type { FieldContext } from '~/features/_library/form-builder/types'

/** Campaign types available in the creation dropdown (p2p-fundraiser excluded — created by supporters) */
const CAMPAIGN_TYPE_OPTIONS: { value: CampaignType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'p2p', label: 'P2P Template' },
  { value: 'event', label: 'Event' }
]

const P2P_PRESET_OPTIONS: { value: P2PPreset; label: string }[] = [
  { value: 'birthday', label: 'Birthday Fundraiser' },
  { value: 'tribute', label: 'Tribute & Memorial' },
  { value: 'challenge', label: 'Challenge Fundraiser' },
  { value: 'wedding', label: 'Wedding Fundraiser' },
  { value: 'custom', label: 'Custom' }
]

/**
 * Standalone form for campaign creation wizard.
 * Single step with dynamic fields based on campaign type.
 * Not coupled to useCampaignConfigStore — data flows through v-model.
 */
export const useCampaignCreateWizardForm = defineForm('campaignCreate', () => {
  const currencyStore = useCurrencySettingsStore()

  const campaignType = selectField('campaignType', {
    label: 'Campaign Type',
    description: 'Determines available features and donor experience',
    options: CAMPAIGN_TYPE_OPTIONS,
    defaultValue: 'standard',
    rules: z.string().min(1, 'Campaign type is required')
  })

  const p2pPreset = selectField('p2pPreset', {
    label: 'P2P Preset',
    description: 'Pre-fills title, description, and story with a themed template',
    options: P2P_PRESET_OPTIONS,
    defaultValue: 'custom',
    visibleWhen: ({ values }: FieldContext) => values.campaignType === 'p2p'
  })

  const title = textField('title', {
    label: 'Campaign Title',
    description: 'Main headline shown on the crowdfunding page',
    placeholder: 'Help Save Borneo Orangutans',
    rules: z.string().min(5, 'Title must be at least 5 characters')
  })

  const shortDescription = textareaField('shortDescription', {
    label: 'Short Description',
    description: 'Brief summary shown in previews and cards (max 275 chars)',
    placeholder: 'Support the rehabilitation and protection of endangered orangutans...',
    maxLength: 275,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
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
    p2pPreset,
    title,
    shortDescription,
    currency,
    goalAmount,
    endDate
  }
})
