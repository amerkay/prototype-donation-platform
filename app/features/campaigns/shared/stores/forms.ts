import { defineStore } from 'pinia'
import type { CampaignForm } from '~/features/campaigns/shared/types'
import { getFormsByCampaignId } from '~/sample-api-responses/api-sample-response-forms'

/**
 * Forms store
 * Manages reactive state for campaign donation forms
 * Wraps sample data to enable mutations (set default, etc.)
 */
export const useFormsStore = defineStore('forms', () => {
  // Initialize from sample data - would come from API in real app
  const formsData = ref<Record<string, CampaignForm[]>>({})

  // Get forms for a campaign, initializing from sample data if needed
  const getForms = (campaignId: string): CampaignForm[] => {
    if (!formsData.value[campaignId]) {
      formsData.value[campaignId] = getFormsByCampaignId(campaignId)
    }
    return formsData.value[campaignId]
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
  }

  return {
    getForms,
    setDefaultForm
  }
})
