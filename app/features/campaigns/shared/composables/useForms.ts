import { toast } from 'vue-sonner'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'
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

  // Rename a form
  const renameForm = (formId: string, newName: string): void => {
    formsStore.renameForm(campaignId, formId, newName)
    toast.success('Form name updated')
  }

  // Get form by ID (falls back to sample data for forms not yet in store)
  const getForm = (formId: string): CampaignForm | undefined => {
    // First check local forms store (includes newly created/duplicated forms)
    const formsList = formsStore.getForms(campaignId)
    const formInStore = formsList.find((f) => f.id === formId)
    if (formInStore) {
      return formInStore
    }

    // Fall back to API sample response for existing forms
    return getFormById(formId)
  }

  // Update form (mock - would call API in real app)
  const updateForm = async (
    formId: string,
    config: CampaignForm['config'],
    products: CampaignForm['products']
  ): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Update store and persist to sessionStorage
    formsStore.updateFormConfig(campaignId, formId, config, products)
  }

  // Create a new form from template
  const createForm = async (
    formId: string,
    name: string,
    config: FullFormConfig,
    products: Product[]
  ): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Add to store
    formsStore.addForm(campaignId, formId, name, config, products)
  }

  // Duplicate an existing form
  const duplicateForm = async (
    sourceFormId: string,
    newFormId: string,
    newName: string
  ): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Duplicate in store
    formsStore.duplicateForm(campaignId, sourceFormId, newFormId, newName)
  }

  // Delete a form
  const deleteForm = async (formId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Delete from store
    formsStore.deleteForm(campaignId, formId)
  }

  return {
    forms,
    defaultForm,
    getEnabledFeaturesCount,
    formatDate,
    setDefaultForm,
    renameForm,
    getForm,
    updateForm,
    createForm,
    duplicateForm,
    deleteForm
  }
}
