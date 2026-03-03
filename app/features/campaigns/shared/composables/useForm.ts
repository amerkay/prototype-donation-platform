import { toast } from 'vue-sonner'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
/**
 * Single-form composable for 1:1 campaign:form relationship.
 * Reads/writes the campaign config store's `form` ref directly.
 */
export function useForm() {
  const store = useCampaignConfigStore()

  /** The campaign's single form (reactive) */
  const form = computed(() => store.form)

  /** Whether a form exists */
  const hasForm = computed(() => store.form !== null)

  /** Count of features enabled in the form */
  const getEnabledFeaturesCount = (): number => {
    if (!store.form) return 0
    const features = store.form.config.features
    return Object.values(features).filter((feature: unknown) => {
      const f = feature as { enabled?: boolean }
      return f?.enabled === true
    }).length
  }

  /** Update the form's config and products */
  const updateForm = async (config: FullFormConfig, products: Product[]): Promise<void> => {
    if (!store.form || !store.id) return
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.form = {
      ...store.form,
      config,
      products,
      updatedAt: new Date().toISOString()
    }
  }

  /** Set a new form (from template or copy) */
  const setForm = async (form: CampaignForm): Promise<void> => {
    if (!store.id) return
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.form = { ...form, campaignId: store.id }
    store.markDirty()
  }

  /** Rename the form */
  const renameForm = (newName: string): void => {
    if (!store.form) return
    store.form = { ...store.form, name: newName }
    toast.success('Form name updated')
  }

  /** Clear the form (set to null) */
  const clearForm = (): void => {
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
