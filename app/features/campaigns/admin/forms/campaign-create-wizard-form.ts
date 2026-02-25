import * as z from 'zod'
import {
  defineForm,
  textField,
  textareaField,
  currencyField,
  comboboxField
} from '~/features/_library/form-builder/api'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import {
  getCurrencyOptionsForSelect,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import type { FieldContext } from '~/features/_library/form-builder/types'

/**
 * Standalone form for campaign creation wizard Step 1.
 * Not coupled to useCampaignConfigStore — data flows through v-model.
 */
export const useCampaignCreateWizardForm = defineForm('campaignCreate', () => {
  const currencyStore = useCurrencySettingsStore()

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

  const goalAmount = currencyField('goalAmount', {
    label: 'Goal Amount',
    description: 'Target fundraising amount (optional)',
    placeholder: '500',
    min: 0,
    currencySymbol: ({ values }: FieldContext) =>
      getCurrencySymbol((values?.currency as string) || currencyStore.defaultCurrency),
    rules: z.number().min(1, 'Goal must be at least 1').optional()
  })

  const currency = comboboxField('currency', {
    label: 'Campaign Currency',
    description: 'Cannot be changed after creation',
    defaultValue: currencyStore.defaultCurrency,
    searchPlaceholder: 'Search currencies...',
    options: () => getCurrencyOptionsForSelect(currencyStore.supportedCurrencies),
    rules: z.string().min(1, 'Currency is required')
  })

  return { title, shortDescription, currency, goalAmount }
})
