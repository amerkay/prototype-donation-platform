<script setup lang="ts">
/**
 * Print-ready certificate page for PDF generation.
 *
 * Puppeteer navigates to this page with a token parameter.
 * The token is used to retrieve the certificate model from server storage.
 */
import { getBunnyFontUrls } from '~/features/settings/admin/utils/fonts'
import type { CertificateModel } from '~/features/templates/shared/types'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import CertificateLayout from '~/features/templates/shared/components/certificate/CertificateLayout.vue'
import { fitAdaptiveText } from '~/features/templates/shared/composables/useAdaptiveText'

definePageMeta({
  layout: 'print'
})

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

// Fetch certificate model from server using token
const { data: model, error } = await useFetch<CertificateModel>('/api/print-data', {
  query: { token },
  server: true
})

if (error.value || !model.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Certificate data not found or token expired'
  })
}

// Calculate page dimensions
const isLandscape = computed(() => model.value?.layout === 'landscape-classic')
const pageWidth = computed(() => (isLandscape.value ? '297mm' : '210mm'))
const pageHeight = computed(() => (isLandscape.value ? '210mm' : '297mm'))

const geometry = computed(() => (model.value ? getPageRenderGeometry(model.value.layout) : null))

// Load fonts
const fontFamilies = computed(() => {
  if (!model.value) return []
  return [
    model.value.branding.fontFamily,
    model.value.signature?.fontFamily,
    model.value.donorName?.fontFamily
  ].filter(Boolean) as string[]
})

useHead({
  style: [
    {
      innerHTML: `:root { --page-width: ${pageWidth.value}; --page-height: ${pageHeight.value}; }`
    }
  ],
  link: computed(() =>
    getBunnyFontUrls(fontFamilies.value).map((href) => ({
      rel: 'stylesheet',
      href
    }))
  )
})

// Expose adaptive text fitter for Puppeteer to call
if (import.meta.client) {
  ;(
    window as Window & { __fitCertificateAdaptiveText?: typeof fitAdaptiveText }
  ).__fitCertificateAdaptiveText = fitAdaptiveText
}

const contentRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // Run adaptive text fitting after layout
  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (contentRef.value) {
          fitAdaptiveText(contentRef.value)
        }
      })
    })
  })
})
</script>

<template>
  <div
    v-if="model && geometry"
    ref="contentRef"
    class="overflow-hidden"
    :style="{
      width: `${geometry.canvasWidthPx}px`,
      height: `${geometry.canvasHeightPx}px`
    }"
  >
    <CertificateLayout :model="model" />
  </div>
</template>
