<script setup lang="ts">
import { computed, ref, toRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
import { useCertificatePreviewModel } from '~/features/templates/admin/composables/useCertificatePreviewModel'
import { CERTIFICATE_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/certificate-template-form'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import { useAdaptiveText } from '~/features/templates/shared/composables/useAdaptiveText'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import CertificateLayout from '~/features/templates/shared/components/certificate/CertificateLayout.vue'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-vue-next'

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

const sampleProduct = computed(() => {
  // Use override product if provided
  if (props.product) {
    return {
      name: props.product.certificateOverrideName || props.product.name,
      image: props.product.image || '',
      text: props.product.certificateText
    }
  }
  // Try to find a real product with image and certificate name
  const p = products.value.find((product) => product.image && product.certificateOverrideName)
  if (p?.image) {
    return {
      name: p.certificateOverrideName || p.name,
      image: p.image,
      text: p.certificateText
    }
  }
  // Fallback sample product for preview when no real products exist
  return { name: 'Baby Orangutan', image: 'https://placehold.co/200x200/f97316/ffffff?text=🦧' }
})

const { certificateModel } = useCertificatePreviewModel(() => cert.flatSettings, {
  product: sampleProduct,
  amount: sampleAmount,
  targets: CERTIFICATE_TEMPLATE_TARGETS
})

const previewRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
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
    class="relative overflow-hidden shadow-sm mx-auto max-w-95 w-full"
    :class="{ editable: editable }"
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

<style scoped>
.editable :deep([data-field]) {
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
