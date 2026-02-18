<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { RECEIPT_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/receipt-template-form'
import { formatCurrency } from '~/lib/formatCurrency'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import type { ReceiptModel } from '~/features/templates/shared/types'
import ReceiptLayout from '~/features/templates/shared/components/receipt/ReceiptLayout.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'

const props = withDefaults(
  defineProps<{
    currency?: string
    editable?: boolean
  }>(),
  { editable: false }
)

const receipt = useReceiptTemplateStore()
const charityStore = useCharitySettingsStore()
const branding = useBrandingSettingsStore()
const currencyStore = useCurrencySettingsStore()

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const charityInfo = computed(() => charityStore.getCharityForCurrency(activeCurrency.value))
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

// Page geometry (receipts are always portrait A4)
const geometry = getPageRenderGeometry('portrait')

const receiptModel = computed<ReceiptModel>(() => ({
  headerText: receipt.headerText,
  footerText: receipt.footerText,
  showGiftAid: receipt.showGiftAid,
  showPaymentMethod: receipt.showPaymentMethod,
  showCampaignName: receipt.showCampaignName,
  showLogo: receipt.showLogo,
  taxDeductibleStatement: receipt.taxDeductibleStatement,
  showDonorAddress: receipt.showDonorAddress,
  branding: {
    logoUrl: branding.logoUrl,
    primaryColor: branding.primaryColor
  },
  charity: {
    name: charityInfo.value.name,
    registrationNumber: charityInfo.value.registrationNumber,
    address: charityInfo.value.address
  },
  donation: {
    receiptNumber: 'RCP-2025-001234',
    date: sampleDate,
    donorName: 'John Smith',
    donorAddress: '123 Example Street\nLondon, SW1A 1AA',
    amount: sampleAmount.value,
    currency: activeCurrency.value,
    campaign: 'Emergency Relief Fund',
    paymentMethod: 'Visa ••••4242'
  }
}))

const previewEditableRef = ref<InstanceType<typeof PreviewEditable> | null>(null)
const previewScale = ref(1)
let resizeObserver: ResizeObserver | null = null

function getContainerEl() {
  return previewEditableRef.value?.$el as HTMLElement | null
}

function updatePreviewScale() {
  const container = getContainerEl()
  if (!container) return

  const widthRatio = container.clientWidth / geometry.canvasWidthPx
  const heightRatio = container.clientHeight / geometry.canvasHeightPx
  previewScale.value = Math.min(widthRatio, heightRatio) || 1
}

onMounted(() => {
  updatePreviewScale()

  const el = getContainerEl()
  if (el) {
    resizeObserver = new ResizeObserver(() => updatePreviewScale())
    resizeObserver.observe(el)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <PreviewEditable
    ref="previewEditableRef"
    :enabled="editable"
    class="overflow-hidden rounded-lg border shadow-sm mx-auto max-w-95 w-full"
    :style="{
      aspectRatio: `${geometry.canvasWidthPx} / ${geometry.canvasHeightPx}`
    }"
  >
    <div
      class="absolute left-0 top-0 origin-top-left overflow-hidden"
      :style="{
        width: `${geometry.canvasWidthPx}px`,
        height: `${geometry.canvasHeightPx}px`,
        transform: `scale(${previewScale})`
      }"
    >
      <ReceiptLayout
        :model="receiptModel"
        :targets="editable ? RECEIPT_TEMPLATE_TARGETS : undefined"
      />
    </div>
  </PreviewEditable>
</template>
