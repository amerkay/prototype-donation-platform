import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ReceiptTemplate } from '~/features/templates/admin/types'
import { receiptTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { useEditableState } from '~/features/_admin/composables/defineEditableStore'

export const useReceiptTemplateStore = defineStore('receiptTemplate', () => {
  const { isDirty, isSaving, markDirty, markClean } = useEditableState()

  const headerText = ref(defaults.headerText)
  const footerText = ref(defaults.footerText)
  const showGiftAid = ref(defaults.showGiftAid)
  const showPaymentMethod = ref(defaults.showPaymentMethod)
  const showCampaignName = ref(defaults.showCampaignName)
  const showLogo = ref(defaults.showLogo)
  const taxDeductibleStatement = ref(defaults.taxDeductibleStatement)
  const showDonorAddress = ref(defaults.showDonorAddress)

  function initialize(t: ReceiptTemplate) {
    headerText.value = t.headerText
    footerText.value = t.footerText
    showGiftAid.value = t.showGiftAid
    showPaymentMethod.value = t.showPaymentMethod
    showCampaignName.value = t.showCampaignName
    showLogo.value = t.showLogo
    taxDeductibleStatement.value = t.taxDeductibleStatement
    showDonorAddress.value = t.showDonorAddress
    markClean()
  }

  function updateSettings(t: Partial<ReceiptTemplate>) {
    if (t.headerText !== undefined) headerText.value = t.headerText
    if (t.footerText !== undefined) footerText.value = t.footerText
    if (t.showGiftAid !== undefined) showGiftAid.value = t.showGiftAid
    if (t.showPaymentMethod !== undefined) showPaymentMethod.value = t.showPaymentMethod
    if (t.showCampaignName !== undefined) showCampaignName.value = t.showCampaignName
    if (t.showLogo !== undefined) showLogo.value = t.showLogo
    if (t.taxDeductibleStatement !== undefined)
      taxDeductibleStatement.value = t.taxDeductibleStatement
    if (t.showDonorAddress !== undefined) showDonorAddress.value = t.showDonorAddress
    markDirty()
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('template-receipt')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function save() {
    try {
      sessionStorage.setItem(
        'template-receipt',
        JSON.stringify({
          headerText: headerText.value,
          footerText: footerText.value,
          showGiftAid: showGiftAid.value,
          showPaymentMethod: showPaymentMethod.value,
          showCampaignName: showCampaignName.value,
          showLogo: showLogo.value,
          taxDeductibleStatement: taxDeductibleStatement.value,
          showDonorAddress: showDonorAddress.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    headerText,
    footerText,
    showGiftAid,
    showPaymentMethod,
    showCampaignName,
    showLogo,
    taxDeductibleStatement,
    showDonorAddress,
    isDirty,
    isSaving,
    initialize,
    updateSettings,
    markDirty,
    markClean,
    $hydrate,
    save
  }
})
