<script setup lang="ts">
import { computed, ref, toRef, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import {
  buildCertificateFragment,
  getFragmentOrientation
} from '~/features/templates/admin/builders/certificate-fragment'
import { getBunnyFontUrls } from '~/features/settings/admin/utils/fonts'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
import { CERTIFICATE_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/certificate-template-form'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'
import { fitAdaptiveText } from '~/features/templates/admin/builders/adaptive-text'
import {
  getCertificateRenderGeometry,
  getCertificateContentGeometry
} from '~/features/templates/admin/builders/render-geometry'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    currency?: string
    editable?: boolean
  }>(),
  { editable: false }
)

const cert = useCertificateTemplateStore()
const branding = useBrandingSettingsStore()
const currencyStore = useCurrencySettingsStore()
const { products } = useProducts()

useHead({
  link: computed(() =>
    getBunnyFontUrls([
      branding.fontFamily,
      cert.certificate.signatureSettings.signatureFontFamily,
      cert.certificate.donorNameSettings.donorNameFontFamily
    ]).map((href) => ({
      rel: 'stylesheet',
      href
    }))
  )
})

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

const isLandscape = computed(
  () => getFragmentOrientation(cert.certificate.design.layout) === 'landscape'
)
const geometry = computed(() => getCertificateRenderGeometry(cert.certificate.design.layout))
const contentGeometry = computed(() =>
  getCertificateContentGeometry(cert.certificate.design.layout)
)
const contentScale = computed(() => geometry.value.canvasWidthPx / contentGeometry.value.widthPx)

const sampleProduct = computed(() => {
  // Try to find a real product with image and certificate name
  const p = products.value.find((product) => product.image && product.certificateOverrideName)
  if (p?.image) {
    return { name: p.certificateOverrideName || p.name, image: p.image }
  }
  // Fallback sample product for preview when no real products exist
  return { name: 'Baby Orangutan', image: 'https://placehold.co/200x200/f97316/ffffff?text=🦧' }
})

const fragment = computed(() => {
  const variableValues = {
    DONOR_NAME: 'John Smith',
    AMOUNT: sampleAmount.value,
    DATE: sampleDate
  }
  const subtitleHtml = processTemplateRichText(cert.certificate.header.subtitle, variableValues)
  const bodyHtml = processTemplateRichText(cert.certificate.body.bodyText, variableValues)

  return buildCertificateFragment({
    title: cert.certificate.header.title,
    subtitleHtml,
    bodyHtml,
    pageBorderStyle: cert.certificate.design.pageBorderStyle,
    pageBorderThickness: cert.certificate.design.pageBorderThickness,
    layout: cert.certificate.design.layout,
    showLogo: cert.certificate.header.showLogo,
    logoSize: cert.certificate.header.logoSize,
    showSignature: cert.certificate.signatureSettings.showSignature,
    signatureName: cert.certificate.signatureSettings.signatureName,
    signatureTitle: cert.certificate.signatureSettings.signatureTitle,
    signatureFontFamily: cert.certificate.signatureSettings.signatureFontFamily,
    backgroundImage: cert.certificate.design.backgroundImage,
    showProduct: cert.certificate.productSettings.showProduct,
    productImageShape: cert.certificate.productSettings.productImageShape,
    titleTextColor: cert.certificate.header.titleTextColor,
    separatorsAndBordersColor: cert.certificate.design.separatorsAndBordersColor,
    showDate: cert.certificate.dateSettings.showDate,
    showDonorName: cert.certificate.donorNameSettings.showDonorName,
    donorNameFontFamily: cert.certificate.donorNameSettings.donorNameFontFamily,
    donorNamePosition: cert.certificate.donorNameSettings.donorNamePosition,
    footerText: cert.certificate.footerSettings.footerText,
    donorName: 'John Smith',
    date: sampleDate,
    targets: CERTIFICATE_TEMPLATE_TARGETS,
    branding: {
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      fontFamily: branding.fontFamily
    },
    product: sampleProduct.value
  })
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

function runAdaptiveTextFit() {
  const container = contentRef.value
  if (!container) return

  nextTick(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fitAdaptiveText(container)
      })
    })
  })
}

// Re-run adaptive text when fragment or layout orientation changes
watch(fragment, () => runAdaptiveTextFit(), { flush: 'post' })
watch(isLandscape, () => {
  updatePreviewScale()
  runAdaptiveTextFit()
})

onMounted(() => {
  updatePreviewScale()
  runAdaptiveTextFit()

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
      class="absolute left-0 top-0 origin-top-left"
      :style="{
        width: `${geometry.canvasWidthPx}px`,
        height: `${geometry.canvasHeightPx}px`,
        transform: `scale(${previewScale})`
      }"
    >
      <div
        ref="contentRef"
        class="origin-top-left overflow-hidden"
        :style="{
          width: `${contentGeometry.widthPx}px`,
          height: `${contentGeometry.heightPx}px`,
          transform: `scale(${contentScale})`
        }"
      >
        <!-- eslint-disable-next-line vue/no-v-html -- trusted builder output, body pre-sanitized -->
        <div class="h-full w-full" v-html="fragment" />
      </div>
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
