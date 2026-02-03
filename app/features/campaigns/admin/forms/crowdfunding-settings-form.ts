import * as z from 'zod'
import {
  defineForm,
  toggleField,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  numberField,
  currencyField
} from '~/features/_library/form-builder/api'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'

/**
 * Crowdfunding page settings form
 * Handles all public-facing crowdfunding page configuration
 * For P2P templates, labels are prefixed with "Default" and "enabled" toggle is hidden
 */
export const useCrowdfundingSettingsForm = defineForm('crowdfunding', (_ctx) => {
  const store = useCampaignConfigStore()

  const enabled = toggleField('enabled', {
    label: 'Enable Crowdfunding Page',
    description: 'Make this campaign publicly accessible',
    labelClass: 'font-bold',
    showSeparatorAfter: true,
    // Hide for P2P templates (always enabled)
    visibleWhen: () => !store.isP2P
  })

  const isEnabled = ({ values }: { values: Record<string, unknown> }) =>
    values.enabled === true || store.isP2P

  const title = textField('title', {
    label: () => (store.isP2P ? 'Default Page Title' : 'Page Title'),
    description: () =>
      store.isP2P
        ? 'Default headline for fundraiser pages'
        : 'Main headline shown on the crowdfunding page',
    placeholder: 'Help Save Borneo Orangutans',
    visibleWhen: isEnabled,
    rules: z.string().min(5, 'Title must be at least 5 characters')
  })

  const shortDescription = textareaField('shortDescription', {
    label: () => (store.isP2P ? 'Default Short Description' : 'Short Description'),
    description: () =>
      store.isP2P
        ? 'Default brief summary shown in previews and cards (max 275 chars)'
        : 'Brief summary shown in previews and cards (max 275 chars)',
    placeholder: 'Support the rehabilitation and protection of endangered orangutans...',
    visibleWhen: isEnabled,
    maxLength: 275,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
  })

  const coverPhoto = imageUploadField('coverPhoto', {
    label: () => (store.isP2P ? 'Default Cover Photo' : 'Cover Photo'),
    description: () =>
      store.isP2P
        ? 'Default campaign cover image (recommended: 1200x675px, 16:9 ratio)'
        : 'Upload a campaign cover image (recommended: 1200x675px, 16:9 ratio)',
    visibleWhen: isEnabled,
    accept: 'image/*',
    recommendedDimensions: '1200x675px',
    optional: true
  })

  const story = textareaField('story', {
    label: () => (store.isP2P ? 'Default Campaign Story' : 'Campaign Story'),
    description: () =>
      store.isP2P
        ? 'Default story template with multiple paragraphs (use \\n\\n for line breaks)'
        : 'Full story with multiple paragraphs (use \\n\\n for line breaks)',
    placeholder: 'Tell your compelling story here...',
    visibleWhen: isEnabled,
    rows: 8,
    rules: z.string().min(100, 'Story must be at least 100 characters'),
    showSeparatorAfter: true
  })

  const goalAmount = currencyField('goalAmount', {
    label: () => (store.isP2P ? 'Default Goal Amount' : 'Goal Amount'),
    description: () =>
      store.isP2P
        ? 'Default target fundraising amount for new fundraisers'
        : 'Target fundraising amount (optional)',
    placeholder: '500',
    optional: true,
    min: 0,
    currencySymbol: '£',
    visibleWhen: isEnabled,
    rules: z.number().min(1, 'Goal must be at least 1').optional()
  })

  const showProgressBar = toggleField('showProgressBar', {
    label: () => (store.isP2P ? 'Default Show Progress Bar' : 'Show Progress Bar'),
    description: () =>
      store.isP2P
        ? 'Display goal progress visualization by default'
        : 'Display goal progress visualization',
    visibleWhen: isEnabled,
    optional: true,
    showSeparatorAfter: true
  })

  const showRecentDonations = toggleField('showRecentDonations', {
    label: () => (store.isP2P ? 'Default Show Recent Donations' : 'Show Recent Donations'),
    description: () =>
      store.isP2P
        ? 'Display list of recent supporters by default'
        : 'Display list of recent supporters',
    visibleWhen: isEnabled,
    optional: true
  })

  const defaultDonationsView = selectField('defaultDonationsView', {
    label: 'Default Donations View',
    description: 'Which donation list to show by default',
    options: [
      { value: 'recent', label: 'Recent - Show latest donations first' },
      { value: 'top', label: 'Top - Show largest donations first' }
    ],
    visibleWhen: ({ values }) => isEnabled({ values }) && values.showRecentDonations === true,
    rules: z.enum(['recent', 'top'])
  })

  const numberOfDonationsToShow = numberField('numberOfDonationsToShow', {
    label: () =>
      store.isP2P ? 'Default Number of Donations to Show' : 'Number of Donations to Show',
    description: () =>
      store.isP2P
        ? 'How many donations to display in the list by default'
        : 'How many donations to display in the list',
    min: 5,
    max: 50,
    step: 5,
    visibleWhen: ({ values }) => isEnabled({ values }) && values.showRecentDonations === true,
    rules: z.number().min(5).max(50)
  })

  return {
    enabled,

    title,
    shortDescription,
    coverPhoto,
    story,

    goalAmount,
    showProgressBar,

    showRecentDonations,
    defaultDonationsView,
    numberOfDonationsToShow
  }
})
