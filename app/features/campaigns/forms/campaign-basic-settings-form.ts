import * as z from 'zod'
import { defineForm, textField, selectField } from '~/features/form-builder/api'

/**
 * Campaign basic settings form
 * Handles campaign name and status
 */
export const useCampaignBasicSettingsForm = defineForm('campaign-basic', (_ctx) => {
  const name = textField('name', {
    label: 'Campaign Name',
    description: 'The display name for this campaign',
    placeholder: 'e.g., Adopt an Orangutan',
    rules: z.string().min(3, 'Campaign name must be at least 3 characters')
  })

  const status = selectField('status', {
    label: 'Campaign Status',
    description: 'Control campaign visibility and state',
    options: [
      { value: 'draft', label: 'Draft - Hidden from public' },
      { value: 'active', label: 'Active - Live and accepting donations' },
      { value: 'paused', label: 'Paused - Temporarily disabled' },
      { value: 'completed', label: 'Completed - Goal reached' },
      { value: 'archived', label: 'Archived - No longer accepting donations' }
    ],
    rules: z.enum(['draft', 'active', 'paused', 'completed', 'archived'])
  })

  return { name, status }
})
