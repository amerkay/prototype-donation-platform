import type { ReceiptTemplate } from '~/features/templates/admin/types'
import { receiptTemplate as defaults } from '~/sample-api-responses/api-sample-response-templates'
import { defineSettingsStore } from '~/features/_admin/composables/defineSettingsStore'

export const useReceiptTemplateStore = defineSettingsStore<ReceiptTemplate>('receiptTemplate', {
  defaults,
  storageKey: 'template-receipt'
})
