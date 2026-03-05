import { toast } from 'vue-sonner'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
/**
 * Single-form composable for 1:1 campaign:form relationship.
 * Reads/writes the campaign config store's formConfig namespace.
 */
export function useForm() {
  const store = useCampaignConfigStore()
  const { updateCampaign } = useCampaigns()

  /** The campaign's assembled form (reactive, computed from formConfig state) */
  const form = computed(() => store.assembledForm)

  /** Whether a form exists */
  const hasForm = computed(() => store.formConfig.formId !== null)

  /** Count of features enabled in the form */
  const getEnabledFeaturesCount = (): number => {
    const fc = store.formConfig
    const features = [
      fc.impactCart,
      fc.productSelector,
      fc.impactBoost,
      fc.coverCosts,
      fc.giftAid,
      fc.tribute,
      fc.entryFields,
      fc.contactConsent,
      fc.terms
    ]
    return features.filter((f) => (f as { enabled?: boolean } | null)?.enabled === true).length
  }

  /** Save the form config back to the campaign (reconstructs CampaignForm from formConfig state) */
  const updateForm = async (): Promise<void> => {
    if (!store.assembledForm || !store.id) return
    const updatedForm = {
      ...store.assembledForm,
      updatedAt: new Date().toISOString()
    }
    store.form = updatedForm
    // Sync back to campaigns singleton so changes survive navigation
    await updateCampaign(store.id, { form: updatedForm })
  }

  /** Set a new form (from template or copy) — decomposes into formConfig state */
  const setForm = async (newForm: CampaignForm): Promise<void> => {
    if (!store.id) return
    await new Promise((resolve) => setTimeout(resolve, 300))
    const formWithCampaign = { ...newForm, campaignId: store.id }
    // Decompose into formConfig.* state
    store.initializeFormConfig(formWithCampaign, store.type)
    // Also keep the raw form ref updated for fullCampaign computed
    store.form = formWithCampaign
    store.markDirty()
  }

  /** Rename the form */
  const renameForm = (newName: string): void => {
    if (!store.formConfig.formId) return
    store.formConfig.formName = newName
    toast.success('Form name updated')
  }

  /** Clear the form (set to null) */
  const clearForm = (): void => {
    store.initializeFormConfig(null)
    store.form = null
    store.markDirty()
  }

  return {
    form,
    hasForm,
    getEnabledFeaturesCount,
    updateForm,
    setForm,
    renameForm,
    clearForm
  }
}
