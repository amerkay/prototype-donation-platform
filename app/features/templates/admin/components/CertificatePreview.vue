<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificatePreviewModel } from '~/features/templates/admin/composables/useCertificatePreviewModel'
import { CERTIFICATE_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/certificate-template-form'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import { useAdaptiveText } from '~/features/templates/shared/composables/useAdaptiveText'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import CertificateLayout from '~/features/templates/shared/components/certificate/CertificateLayout.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'

const props = withDefaults(
  defineProps<{
    currency?: string
    editable?: boolean
    /** Override the auto-selected product for preview */
    product?: Product
  }>(),
  { editable: false }
)

const cert = useCertificateTemplateStore()
const currencyStore = useCurrencySettingsStore()
const { products } = useProducts()

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const isLandscape = computed(() => cert.certificate.page.layout === 'landscape-classic')
const geometry = computed(() => getPageRenderGeometry(cert.certificate.page.layout))

// Effective linked products (same logic as CertificateProductAssignment)
const linkedProducts = computed(() =>
  products.value.filter((p) => {
    if (cert.pendingProductUnlinks.has(p.id)) return false
    if (cert.pendingProductLinks.has(p.id)) return true
    return p.certificateTemplateId === cert.id
  })
)

const sampleProduct = computed(() => {
  // Use override product if provided (explicit eye-icon selection)
  if (props.product) {
    return {
      name: props.product.certificateOverrideName || props.product.name,
      image: props.product.image || '',
      text: props.product.certificateText
    }
  }
  // Use first linked product, then fall back to first available product
  const p = linkedProducts.value[0] || products.value[0]
  if (p) {
    return {
      name: p.certificateOverrideName || p.name,
      image: p.image || '',
      text: p.certificateText
    }
  }
  // Fallback only when no products exist at all
  return { name: 'Sample Product', image: '' }
})

const { certificateModel } = useCertificatePreviewModel(() => cert.flatSettings, {
  product: sampleProduct,
  amount: sampleAmount,
  targets: CERTIFICATE_TEMPLATE_TARGETS
})

const previewEditableRef = ref<InstanceType<typeof PreviewEditable> | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const previewScale = ref(1)
let resizeObserver: ResizeObserver | null = null

function getContainerEl() {
  return previewEditableRef.value?.$el as HTMLElement | null
}

function updatePreviewScale() {
  const container = getContainerEl()
  if (!container) return

  const widthRatio = container.clientWidth / geometry.value.canvasWidthPx
  const heightRatio = container.clientHeight / geometry.value.canvasHeightPx
  previewScale.value = Math.min(widthRatio, heightRatio) || 1
}

// Use adaptive text composable
const { runFit } = useAdaptiveText(contentRef, [certificateModel])

// Re-run on layout orientation changes
watch(isLandscape, () => {
  updatePreviewScale()
  runFit()
})

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
    class="overflow-hidden shadow-sm mx-auto max-w-95 w-full"
    :style="{
      aspectRatio: `${geometry.canvasWidthPx} / ${geometry.canvasHeightPx}`
    }"
  >
    <div
      ref="contentRef"
      class="absolute left-0 top-0 origin-top-left overflow-hidden"
      :style="{
        width: `${geometry.canvasWidthPx}px`,
        height: `${geometry.canvasHeightPx}px`,
        transform: `scale(${previewScale})`
      }"
    >
      <CertificateLayout :model="certificateModel" />
    </div>
  </PreviewEditable>
</template>
