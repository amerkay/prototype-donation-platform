<script setup lang="ts">
import { computed } from 'vue'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useBrandingSettingsStore } from '~/features/settings/admin/stores/brandingSettings'

const cert = useCertificateTemplateStore()
const branding = useBrandingSettingsStore()

const sampleDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date())

const renderedBody = computed(() =>
  cert.bodyText
    .replace('{{ DONOR_NAME }}', 'John Smith')
    .replace('{{ AMOUNT }}', '£50.00')
    .replace('{{ DATE }}', sampleDate)
)

const borderClasses: Record<string, string> = {
  classic: 'border-4 border-double',
  modern: 'border-2',
  minimal: 'border',
  ornate: 'border-4 border-double ring-2 ring-offset-4'
}
</script>

<template>
  <div
    class="bg-white text-black rounded-lg shadow-sm p-10 max-w-lg mx-auto text-center"
    :class="borderClasses[cert.borderStyle]"
    :style="{ borderColor: branding.primaryColor, '--tw-ring-color': branding.accentColor }"
  >
    <!-- Logo placeholder -->
    <div
      v-if="cert.showLogo"
      class="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
      :style="{ backgroundColor: branding.primaryColor }"
    >
      {{ branding.logoUrl ? '🏛' : '✦' }}
    </div>

    <!-- Title -->
    <h2
      class="text-xl font-bold tracking-wide uppercase mb-1"
      :style="{ color: branding.primaryColor, fontFamily: branding.fontFamily }"
    >
      {{ cert.title }}
    </h2>

    <p class="text-xs text-gray-500 mb-6" :style="{ fontFamily: branding.fontFamily }">
      {{ cert.subtitle }}
    </p>

    <!-- Decorative line -->
    <div class="w-16 h-0.5 mx-auto mb-6" :style="{ backgroundColor: branding.accentColor }" />

    <!-- Body -->
    <p
      class="text-sm leading-relaxed text-gray-700 mb-6 max-w-xs mx-auto"
      :style="{ fontFamily: branding.fontFamily }"
    >
      {{ renderedBody }}
    </p>

    <!-- Date -->
    <p v-if="cert.showDate" class="text-xs text-gray-400 mb-6">{{ sampleDate }}</p>

    <!-- Signature -->
    <div v-if="cert.showSignature" class="mt-4">
      <div class="w-24 h-px mx-auto mb-2" :style="{ backgroundColor: branding.primaryColor }" />
      <p class="text-sm font-medium" :style="{ color: branding.primaryColor }">
        {{ cert.signatureName }}
      </p>
      <p class="text-xs text-gray-500">{{ cert.signatureTitle }}</p>
    </div>
  </div>
</template>
