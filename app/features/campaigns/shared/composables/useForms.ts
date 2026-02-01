import type { CampaignForm } from '~/features/campaigns/shared/types'
import { getFormById } from '~/sample-api-responses/api-sample-response-forms'
import { useCampaignFormatters } from './useCampaignFormatters'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'

/**
 * Forms management composable
 * Handles CRUD operations for campaign donation forms
 */
export function useForms(campaignId: string) {
  const formsStore = useFormsStore()

  // Get all forms for this campaign (reactive)
  const forms = computed(() => formsStore.getForms(campaignId))

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

  // Set a form as default
  const setDefaultForm = async (formId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Update store (in real app, would call API then refresh)
    formsStore.setDefaultForm(campaignId, formId)
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
