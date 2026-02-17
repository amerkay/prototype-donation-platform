<script setup lang="ts">
import { computed, ref, toRef, onMounted, onBeforeUnmount } from 'vue'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
import { RECEIPT_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/receipt-template-form'
import { formatCurrency } from '~/lib/formatCurrency'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import type { ReceiptModel } from '~/features/templates/shared/types'
import ReceiptLayout from '~/features/templates/shared/components/receipt/ReceiptLayout.vue'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-vue-next'

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

const previewRef = ref<HTMLElement | null>(null)
const editableRef = toRef(() => props.editable)
const { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField } = usePreviewEditable(
  previewRef,
  editableRef
)
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
    :class="{ editable: editable }"
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

    <Transition name="fade">
      <div
        v-if="editable && hoveredField"
        class="border-2 border-dashed border-gray-500 rounded pointer-events-none"
        :style="hoverOutlineStyle"
      />
    </Transition>

    <Transition name="fade">
      <Button
        v-if="editable && hoveredField"
        variant="secondary"
        size="icon"
        class="h-6 w-6 rounded-full shadow-md pointer-events-auto"
        :style="editButtonStyle"
        @click.stop="navigateToField()"
      >
        <Pencil class="h-3 w-3" />
      </Button>
    </Transition>
  </div>
</template>

<style>
@import '~/features/templates/admin/composables/preview-editable.css';
</style>
