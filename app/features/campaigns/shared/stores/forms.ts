import { defineStore } from 'pinia'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import { getFormsByCampaignId } from '~/sample-api-responses/api-sample-response-forms'

/**
 * Forms store
 * Manages reactive state for campaign donation forms
 * Wraps sample data to enable mutations (set default, etc.)
 */
export const useFormsStore = defineStore('forms', () => {
  // Initialize from sample data - would come from API in real app
  const formsData = ref<Record<string, CampaignForm[]>>({})
  const hydratedCampaigns = ref<Set<string>>(new Set())

  // Get forms for a campaign, initializing from sample data if needed
  const getForms = (campaignId: string): CampaignForm[] => {
    if (!formsData.value[campaignId]) {
      // Try to hydrate from sessionStorage first
      $hydrate(campaignId)

      // If still no data, initialize from sample data
      if (!formsData.value[campaignId]) {
        // Deep clone to avoid shared references between campaigns' sample data
        formsData.value[campaignId] = JSON.parse(JSON.stringify(getFormsByCampaignId(campaignId)))
      }
    }
    return formsData.value[campaignId]!
  }

  // Set a form as default for a campaign
  const setDefaultForm = (campaignId: string, formId: string): void => {
    const forms = getForms(campaignId)

    // Clear existing default
    forms.forEach((form) => {
      form.isDefault = false
    })

    // Set new default
    const targetForm = forms.find((f) => f.id === formId)
    if (targetForm) {
      targetForm.isDefault = true
    }

    // Persist changes
    $persist(campaignId)
  }

  // Add a new form to a campaign
  const addForm = (
    campaignId: string,
    formId: string,
    name: string,
    config: FullFormConfig,
    products: Product[]
  ): void => {
    const forms = getForms(campaignId)

    const newForm: CampaignForm = {
      id: formId,
      campaignId,
      name,
      isDefault: forms.length === 0,
      config,
      products,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    forms.push(newForm)

    // Persist changes
    $persist(campaignId)
  }

  // Duplicate an existing form
  const duplicateForm = (
    campaignId: string,
    sourceFormId: string,
    newFormId: string,
    newName: string
  ): void => {
    const forms = getForms(campaignId)
    const sourceForm = forms.find((f) => f.id === sourceFormId)

    if (!sourceForm) {
      console.error(`Form ${sourceFormId} not found`)
      return
    }

    // Deep clone the config and products
    const duplicatedForm: CampaignForm = {
      id: newFormId,
      campaignId,
      name: newName,
      isDefault: false,
      config: JSON.parse(JSON.stringify(sourceForm.config)),
      products: JSON.parse(JSON.stringify(sourceForm.products)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    forms.push(duplicatedForm)

    // Persist changes
    $persist(campaignId)
  }

  // Rename a form
  const renameForm = (campaignId: string, formId: string, newName: string): void => {
    const forms = getForms(campaignId)
    const form = forms.find((f) => f.id === formId)
    if (form) {
      form.name = newName
      $persist(campaignId)
    }
  }

  // Delete a form from a campaign
  const deleteForm = (campaignId: string, formId: string): void => {
    const forms = getForms(campaignId)
    const formIndex = forms.findIndex((f) => f.id === formId)

    if (formIndex === -1) {
      console.error(`Form ${formId} not found`)
      return
    }

    const formToDelete = forms[formIndex]
    if (!formToDelete) return

    const wasDefault = formToDelete.isDefault

    // Remove the form
    forms.splice(formIndex, 1)

    // If deleted form was default and there are remaining forms, set first as default
    if (wasDefault && forms.length > 0) {
      const firstForm = forms[0]
      if (firstForm) {
        firstForm.isDefault = true
      }
    }

    // Persist changes
    $persist(campaignId)
  }

  // Update a form's config (and optionally products)
  const updateFormConfig = (
    campaignId: string,
    formId: string,
    config: CampaignForm['config'],
    products?: CampaignForm['products']
  ): void => {
    const forms = getForms(campaignId)
    const form = forms.find((f) => f.id === formId)

    if (!form) {
      console.error(`Form ${formId} not found`)
      return
    }

    form.config = config
    if (products !== undefined) {
      form.products = products
    }
    form.updatedAt = new Date().toISOString()

    // Persist changes
    $persist(campaignId)
  }

  // Persistence - save forms to sessionStorage (client-only)
  const $persist = (campaignId: string): void => {
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('campaign_forms').upsert(forms array with campaign_id)
      const forms = formsData.value[campaignId]
      if (forms) {
        sessionStorage.setItem(`forms-${campaignId}`, JSON.stringify(forms))
      }
    } catch (error) {
      console.warn('Failed to persist forms:', error)
    }
  }

  // Hydration - load forms from sessionStorage (client-only)
  const $hydrate = (campaignId: string): void => {
    if (hydratedCampaigns.value.has(campaignId)) return
    if (!import.meta.client) return

    try {
      // TODO-SUPABASE: Replace with supabase.from('campaign_forms').select('*').eq('campaign_id', campaignId)
      const saved = sessionStorage.getItem(`forms-${campaignId}`)
      if (saved) {
        formsData.value[campaignId] = JSON.parse(saved)
      }
      hydratedCampaigns.value.add(campaignId)
    } catch (error) {
      console.warn('Failed to hydrate forms:', error)
      hydratedCampaigns.value.add(campaignId)
    }
  }

  // Delete all forms for a campaign (used when deleting a campaign)
  const deleteCampaignForms = (campaignId: string): void => {
    // TODO-SUPABASE: Replace with supabase.from('campaign_forms').delete().eq('campaign_id', campaignId)
    const { [campaignId]: _, ...rest } = formsData.value
    formsData.value = rest
    hydratedCampaigns.value.delete(campaignId)
    if (import.meta.client) {
      try {
        sessionStorage.removeItem(`forms-${campaignId}`)
      } catch (error) {
        console.warn('Failed to remove campaign forms from sessionStorage:', error)
      }
    }
  }

  return {
    getForms,
    setDefaultForm,
    renameForm,
    addForm,
    duplicateForm,
    deleteForm,
    deleteCampaignForms,
    updateFormConfig
  }
})
