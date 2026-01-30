import type { CampaignForm } from '~/features/campaigns/shared/types'
import { getFormsByCampaignId, getFormById } from '~/sample-api-responses/api-sample-response-forms'
import { useCampaignFormatters } from './useCampaignFormatters'

/**
 * Forms management composable
 * Handles CRUD operations for campaign donation forms
 */
export function useForms(campaignId: string) {
  // Get all forms for this campaign
  const forms = computed(() => getFormsByCampaignId(campaignId))

  // Get the default form
  const defaultForm = computed(() => forms.value.find((f) => f.isDefault) || forms.value[0])

  // Format helpers
  const { formatDate } = useCampaignFormatters()

  // Count of features enabled in a form
  const getEnabledFeaturesCount = (form: CampaignForm): number => {
    const features = form.config.features
    return Object.values(features).filter((feature: unknown) => {
      const f = feature as { enabled?: boolean }
      return f?.enabled === true
    }).length
  }

  // Set a form as default (mock - would call API in real app)
  const setDefaultForm = async (formId: string): Promise<void> => {
    // In real app, this would call an API
    // For now, just simulate the operation
    console.log(`Setting form ${formId} as default for campaign ${campaignId}`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // In a real app, this would update the backend and refresh data
    // For now, we'd need to update the sample data or use a reactive store
  }

  // Get form by ID
  const getForm = (formId: string): CampaignForm | undefined => {
    return getFormById(formId)
  }

  // Update form (mock - would call API in real app)
  const updateForm = async (formId: string, config: CampaignForm['config']): Promise<void> => {
    // In real app, this would call an API endpoint like:
    // await $fetch(`/api/campaigns/${campaignId}/forms/${formId}`, {
    //   method: 'PUT',
    //   body: { config }
    // })

    console.log(`Updating form ${formId} for campaign ${campaignId}`, config)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, this would update the backend
    // For now, we're just simulating the operation
  }

  return {
    forms,
    defaultForm,
    getEnabledFeaturesCount,
    formatDate,
    setDefaultForm,
    getForm,
    updateForm
  }
}
