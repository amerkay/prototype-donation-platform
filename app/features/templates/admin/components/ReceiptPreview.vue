<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import type { ReceiptModel } from '~/features/templates/shared/types'
import ReceiptLayout from '~/features/templates/shared/components/receipt/ReceiptLayout.vue'

const props = defineProps<{
  currency?: string
}>()

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
    amount: sampleAmount.value,
    campaign: 'Emergency Relief Fund',
    paymentMethod: 'Visa ••••4242'
  }
}))

const previewRef = ref<HTMLElement | null>(null)
const previewScale = ref(1)
let resizeObserver: ResizeObserver | null = null

function updatePreviewScale() {
  const container = previewRef.value
  if (!container) return

  const widthRatio = container.clientWidth / geometry.canvasWidthPx
  const heightRatio = container.clientHeight / geometry.canvasHeightPx
  previewScale.value = Math.min(widthRatio, heightRatio) || 1
}

onMounted(() => {
  updatePreviewScale()

  if (previewRef.value) {
    resizeObserver = new ResizeObserver(() => updatePreviewScale())
    resizeObserver.observe(previewRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="previewRef"
    class="relative overflow-hidden rounded-lg border shadow-sm mx-auto max-w-95 w-full"
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
      <ReceiptLayout :model="receiptModel" />
    </div>
  </div>
</template>
