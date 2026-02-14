<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCertificatePreviewModel } from '~/features/templates/admin/composables/useCertificatePreviewModel'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import { useAdaptiveText } from '~/features/templates/shared/composables/useAdaptiveText'
import type { CertificateTemplate } from '~/features/templates/admin/types'
import CertificateLayout from '~/features/templates/shared/components/certificate/CertificateLayout.vue'

const props = defineProps<{
  template: CertificateTemplate
}>()

const { products } = useProducts()

// Always use landscape geometry for the container so all cards line up
const containerGeometry = computed(() => getPageRenderGeometry('landscape'))
// Use the actual template geometry for the inner canvas
const canvasGeometry = computed(() => getPageRenderGeometry(props.template.layout))

// First product linked to this template (with an image)
const linkedProduct = computed(() => {
  const p = products.value.find((p) => p.certificateTemplateId === props.template.id && p.image)
  if (!p?.image) return undefined
  return {
    name: p.certificateOverrideName || p.name,
    image: p.image,
    text: p.certificateText
  }
})

const { certificateModel } = useCertificatePreviewModel(() => props.template, {
  product: linkedProduct
})

const containerRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const scale = ref(1)
let resizeObserver: ResizeObserver | null = null

function updateScale() {
  const el = containerRef.value
  if (!el) return
  scale.value = el.clientWidth / canvasGeometry.value.canvasWidthPx || 1
}

const { runFit } = useAdaptiveText(contentRef, [certificateModel])

onMounted(() => {
  updateScale()
  runFit()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => updateScale())
    resizeObserver.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative overflow-hidden w-full pointer-events-none"
    :style="{
      aspectRatio: `${containerGeometry.canvasWidthPx} / ${containerGeometry.canvasHeightPx}`
    }"
  >
    <div
      ref="contentRef"
      class="absolute left-0 top-0 origin-top-left overflow-hidden"
      :style="{
        width: `${canvasGeometry.canvasWidthPx}px`,
        height: `${canvasGeometry.canvasHeightPx}px`,
        transform: `scale(${scale})`
      }"
    >
      <CertificateLayout :model="certificateModel" />
    </div>
  </div>
</template>
