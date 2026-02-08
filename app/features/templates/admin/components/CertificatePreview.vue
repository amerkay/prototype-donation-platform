<script setup lang="ts">
import { computed } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { formatCurrency } from '~/lib/formatCurrency'
import {
  sanitizeRichText,
  replaceRichTextVariables
} from '~/features/_library/form-builder/utils/sanitize-html'

const props = defineProps<{
  currency?: string
}>()

const cert = useCertificateTemplateStore()
const branding = useBrandingSettingsStore()
const currencyStore = useCurrencySettingsStore()

const activeCurrency = computed(() => props.currency || currencyStore.defaultCurrency)
const sampleAmount = computed(() => formatCurrency(50, activeCurrency.value))

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

const renderedBody = computed(() => {
  const sanitized = sanitizeRichText(cert.bodyText)
  return replaceRichTextVariables(sanitized, {
    DONOR_NAME: 'John Smith',
    AMOUNT: sampleAmount.value,
    DATE: sampleDate
  })
})

const isLandscape = computed(() => cert.orientation === 'landscape')
const hasBackground = computed(() => !!cert.backgroundImage)

const borderClasses: Record<string, string> = {
  classic: 'border-4 border-double',
  modern: 'border-2',
  minimal: 'border',
  ornate: 'border-4 border-double ring-2 ring-offset-4'
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg shadow-sm mx-auto"
    :class="[
      isLandscape ? 'aspect-297/210' : 'aspect-210/297',
      !hasBackground && borderClasses[cert.borderStyle]
    ]"
    :style="{
      borderColor: !hasBackground ? branding.primaryColor : undefined,
      '--tw-ring-color': !hasBackground ? branding.primaryColor : undefined
    }"
  >
    <!-- Background image layer -->
    <img
      v-if="hasBackground"
      :src="cert.backgroundImage!"
      alt=""
      class="absolute inset-0 h-full w-full object-cover"
    />

    <!-- Fallback white background -->
    <div v-if="!hasBackground" class="absolute inset-0 bg-white" />

    <!-- Content -->
    <div
      class="relative z-10 flex h-full flex-col items-center justify-center overflow-hidden text-center"
      :class="isLandscape ? 'px-16 py-8' : 'px-10 py-8'"
    >
      <!-- Logo -->
      <img
        v-if="cert.showLogo && branding.logoUrl"
        :src="branding.logoUrl"
        alt="Logo"
        class="mb-3 h-12 w-auto shrink-0 object-contain"
      />
      <div
        v-else-if="cert.showLogo"
        class="w-12 h-12 rounded-full mx-auto mb-3 flex shrink-0 items-center justify-center text-white text-lg font-bold"
        :style="{ backgroundColor: branding.primaryColor }"
      >
        &#10022;
      </div>

      <!-- Title -->
      <h2
        class="text-xl font-bold tracking-wide uppercase mb-1 line-clamp-2 break-words w-full shrink-0"
        :style="{
          color: branding.primaryColor,
          fontFamily: branding.fontFamily
        }"
      >
        {{ cert.title }}
      </h2>

      <!-- Subtitle -->
      <p
        class="text-xs text-gray-500 mb-4 line-clamp-2 break-words w-full shrink-0"
        :style="{ fontFamily: branding.fontFamily }"
      >
        {{ cert.subtitle }}
      </p>

      <!-- Decorative line -->
      <div class="w-16 h-0.5 mx-auto mb-4 shrink-0" :style="{ backgroundColor: branding.primaryColor }" />

      <!-- Body -->
      <div
        class="certificate-body text-sm leading-relaxed mb-3 mx-auto overflow-hidden text-gray-700 shrink-0"
        :class="isLandscape ? 'max-w-md body-clamp-landscape' : 'max-w-sm body-clamp-portrait'"
        :style="{ fontFamily: branding.fontFamily }"
        v-html="renderedBody"
      />

      <!-- Date -->
      <p v-if="cert.showDate" class="text-xs text-gray-400 mb-2 shrink-0">{{ sampleDate }}</p>

      <!-- Signature -->
      <div v-if="cert.showSignature" class="mt-2 w-full shrink-0">
        <div class="w-24 h-px mx-auto mb-2" :style="{ backgroundColor: branding.primaryColor }" />
        <p
          class="text-sm font-medium truncate max-w-48 mx-auto"
          :style="{ color: branding.primaryColor }"
        >
          {{ cert.signatureName }}
        </p>
        <p class="text-xs text-gray-500 truncate max-w-48 mx-auto">{{ cert.signatureTitle }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.certificate-body :deep(p) {
  margin: 0;
}

.certificate-body :deep(p + p) {
  margin-top: 0.5em;
}

.certificate-body :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.body-clamp-landscape {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.body-clamp-portrait {
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
}
</style>
