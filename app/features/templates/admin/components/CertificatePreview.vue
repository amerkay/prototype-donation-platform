<script setup lang="ts">
import { computed, ref, toRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import { getBunnyFontUrls } from '~/features/settings/admin/utils/fonts'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
import { CERTIFICATE_TEMPLATE_TARGETS } from '~/features/templates/admin/forms/certificate-template-form'
import { processTemplateRichText } from '~/features/templates/admin/utils/template-rich-text'
import { getPageRenderGeometry } from '~/features/templates/admin/utils/page-geometry'
import { useAdaptiveText } from '~/features/templates/shared/composables/useAdaptiveText'
import type { CertificateModel } from '~/features/templates/shared/types'
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
const branding = useBrandingSettingsStore()
const charity = useCharitySettingsStore()
const currencyStore = useCurrencySettingsStore()
const { products } = useProducts()

useHead({
  link: computed(() =>
    getBunnyFontUrls([
      branding.fontFamily,
      cert.certificate.footer.signatureFontFamily,
      cert.certificate.award.donorNameFontFamily
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

const certificateModel = computed<CertificateModel>(() => {
  const variableValues = {
    DONOR_NAME: 'John Smith',
    AMOUNT: sampleAmount.value,
    DATE: sampleDate
  }
  const bodyHtml = processTemplateRichText(cert.certificate.body.bodyText, variableValues)

  return {
    layout: cert.certificate.page.layout,
    branding: {
      logoUrl: branding.logoUrl,
      charityName: charity.name,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      fontFamily: branding.fontFamily
    },
    design: {
      pageBorderStyle: cert.certificate.page.pageBorderStyle,
      pageBorderThickness: cert.certificate.page.pageBorderThickness,
      backgroundType: cert.certificate.page.backgroundType,
      backgroundImage: cert.certificate.page.backgroundImage,
      separatorsAndBordersColor: cert.certificate.page.separatorsAndBordersColor
    },
    header: {
      showLogo: cert.certificate.logo.showLogo,
      logoSize: cert.certificate.logo.logoSize,
      logoPosition: cert.certificate.logo.logoPosition,
      titleLine1: cert.certificate.title.titleLine1,
      titleLine2: cert.certificate.title.titleLine2,
      titleTextColor: cert.certificate.title.titleTextColor
    },
    awardBlock: cert.certificate.award.showAwardSection
      ? {
          textLine1: cert.certificate.award.awardTextLine1,
          donorName: {
            value: 'John Smith',
            show: true,
            fontFamily: cert.certificate.award.donorNameFontFamily
          }
        }
      : undefined,
    bodyHtml,
    product: cert.certificate.product.showProduct
      ? {
          name: sampleProduct.value.name,
          image: sampleProduct.value.image,
          show: true,
          imageShape: cert.certificate.product.productImageShape,
          text: sampleProduct.value.text
        }
      : undefined,
    date: cert.certificate.footer.showDate ? { value: sampleDate, show: true } : undefined,
    signature: cert.certificate.footer.showSignature
      ? {
          show: true,
          name: cert.certificate.footer.signatureName,
          title: cert.certificate.footer.signatureTitle,
          fontFamily: cert.certificate.footer.signatureFontFamily
        }
      : undefined,
    footer: cert.certificate.footer.footerText
      ? { text: cert.certificate.footer.footerText }
      : undefined,
    targets: CERTIFICATE_TEMPLATE_TARGETS
  }
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
