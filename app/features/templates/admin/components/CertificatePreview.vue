<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import {
  sanitizeRichText,
  replaceRichTextVariables
} from '~/features/_library/form-builder/utils/sanitize-html'
import { buildCertificateFragment } from '~/features/templates/admin/builders/certificate-fragment'
import { getBunnyFontUrl } from '~/features/settings/admin/utils/fonts'
import { products as sampleProducts } from '~/sample-api-responses/api-sample-response-products'
import { usePreviewEditable } from '~/features/templates/admin/composables/usePreviewEditable'
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

useHead({
  link: [{ rel: 'stylesheet', href: computed(() => getBunnyFontUrl(branding.fontFamily)) }]
})

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

const isLandscape = computed(() => cert.orientation === 'landscape')

const sampleProduct = computed(() => {
  const p = sampleProducts.find((p) => p.image && p.certificateOverrideName)
  if (!p?.image) return undefined
  return { name: p.certificateOverrideName || p.name, image: p.image }
})

const fragment = computed(() => {
  const processedBody = replaceRichTextVariables(sanitizeRichText(cert.bodyText), {
    DONOR_NAME: 'John Smith',
    AMOUNT: sampleAmount.value,
    DATE: sampleDate
  })

  return buildCertificateFragment({
    title: cert.title,
    subtitle: cert.subtitle,
    bodyHtml: processedBody,
    borderStyle: cert.borderStyle,
    orientation: cert.orientation,
    showLogo: cert.showLogo,
    showDate: cert.showDate,
    showSignature: cert.showSignature,
    signatureName: cert.signatureName,
    signatureTitle: cert.signatureTitle,
    backgroundImage: cert.backgroundImage,
    showProduct: cert.showProduct,
    productBorderRadius: cert.productBorderRadius,
    productBorderColor: cert.productBorderColor,
    productNameColor: cert.productNameColor,
    titleColor: cert.titleColor,
    signatureColor: cert.signatureColor,
    branding: {
      logoUrl: branding.logoUrl,
      primaryColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      fontFamily: branding.fontFamily
    },
    date: sampleDate,
    product: sampleProduct.value
  })
})

const previewRef = ref<HTMLElement | null>(null)
const editableRef = toRef(() => props.editable)
const { hoveredField, editButtonStyle, hoverOutlineStyle, navigateToField } = usePreviewEditable(
  previewRef,
  editableRef
)
</script>

<template>
  <div
    ref="previewRef"
    class="relative overflow-hidden rounded-lg shadow-sm mx-auto max-w-95"
    :class="[isLandscape ? 'aspect-297/210' : 'aspect-210/297', { editable: editable }]"
  >
    <!-- eslint-disable-next-line vue/no-v-html -- trusted builder output, body pre-sanitized -->
    <div class="h-full" v-html="fragment" />

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
