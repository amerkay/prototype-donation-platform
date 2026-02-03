import * as z from 'zod'
import {
  defineForm,
  textField,
  selectField,
  componentField
} from '~/features/_library/form-builder/api'
import FormsList from '~/features/campaigns/admin/components/FormsList.vue'
import CampaignTypeBadge from '~/features/campaigns/admin/components/CampaignTypeBadge.vue'

/**
 * Campaign basic settings form
 * Handles campaign name and status
 */
export const useCampaignBasicSettingsForm = defineForm('campaign-basic', (_ctx) => {
  const campaignType = componentField('campaignType', {
    component: CampaignTypeBadge,
    rules: z.any().optional()
  })

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
    rules: z.enum(['draft', 'active', 'paused', 'completed', 'archived']),
    showSeparatorAfter: true
  })

  // Component field with validation to ensure at least 1 donation form exists
  // Note: Validation uses props.formsCount which is injected by CampaignMasterConfigPanel
  const formsList = componentField('formsList', {
    component: FormsList,
    // Validate using the formsCount prop that will be injected
    rules: z.any().refine(
      (props: Record<string, unknown>) => {
        // Props will contain formsCount injected by parent
        return (props?.formsCount as number | undefined) ?? 0 > 0
      },
      { message: 'At least one donation form is required for this campaign' }
    )
  })

  return { campaignType, name, status, formsList }
})
