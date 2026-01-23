import * as z from 'zod'
import {
  defineForm,
  toggleField,
  textField,
  textareaField,
  imageUploadField,
  selectField,
  numberField
} from '~/features/_library/form-builder/api'

/**
 * Crowdfunding page settings form
 * Handles all public-facing crowdfunding page configuration
 */
export const useCrowdfundingSettingsForm = defineForm('crowdfunding', (_ctx) => {
  const enabled = toggleField('enabled', {
    label: 'Enable Crowdfunding Page',
    description: 'Make this campaign publicly accessible',
    labelClass: 'font-bold',
    isSeparatorAfter: true
  })

  const title = textField('title', {
    label: 'Page Title',
    description: 'Main headline shown on the crowdfunding page',
    placeholder: 'Help Save Borneo Orangutans',
    visibleWhen: ({ values }) => values.enabled === true,
    rules: z.string().min(5, 'Title must be at least 5 characters')
  })

  const shortDescription = textareaField('shortDescription', {
    label: 'Short Description',
    description: 'Brief summary shown in previews and cards (max 275 chars)',
    placeholder: 'Support the rehabilitation and protection of endangered orangutans...',
    visibleWhen: ({ values }) => values.enabled === true,
    maxLength: 275,
    rules: z.string().min(20, 'Description must be at least 20 characters').max(275)
  })

  const coverPhoto = imageUploadField('coverPhoto', {
    label: 'Cover Photo',
    description: 'Upload a campaign cover image (recommended: 1200x675px, 16:9 ratio)',
    visibleWhen: ({ values }) => values.enabled === true,
    accept: 'image/*',
    maxSizeMB: 5,
    recommendedDimensions: '1200x675px',
    optional: true
  })

  const story = textareaField('story', {
    label: 'Campaign Story',
    description: 'Full story with multiple paragraphs (use \\n\\n for line breaks)',
    placeholder: 'Tell your compelling story here...',
    visibleWhen: ({ values }) => values.enabled === true,
    rows: 8,
    rules: z.string().min(100, 'Story must be at least 100 characters')
  })

  const showProgressBar = toggleField('showProgressBar', {
    label: 'Show Progress Bar',
    description: 'Display goal progress visualization',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const showRecentDonations = toggleField('showRecentDonations', {
    label: 'Show Recent Donations',
    description: 'Display list of recent supporters',
    visibleWhen: ({ values }) => values.enabled === true,
    optional: true
  })

  const defaultDonationsView = selectField('defaultDonationsView', {
    label: 'Default Donations View',
    description: 'Which donation list to show by default',
    options: [
      { value: 'recent', label: 'Recent - Show latest donations first' },
      { value: 'top', label: 'Top - Show largest donations first' }
    ],
    visibleWhen: ({ values }) => values.enabled === true && values.showRecentDonations === true,
    rules: z.enum(['recent', 'top'])
  })

  const numberOfDonationsToShow = numberField('numberOfDonationsToShow', {
    label: 'Number of Donations to Show',
    description: 'How many donations to display in the list',
    min: 5,
    max: 50,
    step: 5,
    visibleWhen: ({ values }) => values.enabled === true && values.showRecentDonations === true,
    rules: z.number().min(5).max(50)
  })

  return {
    enabled,
    title,
    shortDescription,
    coverPhoto,
    story,
    showProgressBar,
    showRecentDonations,
    defaultDonationsView,
    numberOfDonationsToShow
  }
})
