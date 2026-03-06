<script setup lang="ts">
import { ref, provide } from 'vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import PreviewNotAvailable from '~/features/_admin/components/PreviewNotAvailable.vue'
import { defineForm } from '~/features/_library/form-builder/api'
import { createGiftAidFields } from '~/features/donation-form/features/gift-aid/donor/forms/gift-aid-declaration-form'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useGiftAidSettingsStore } from '~/features/settings/admin/stores/giftAidSettings'
import { HASH_TARGET_PASSIVE_KEY } from '~/features/_library/form-builder/composables/useHashTarget'
import type { FieldDef } from '~/features/_library/form-builder/types'

// Prevent preview FormRenderer from stealing the global hash target activator
provide(HASH_TARGET_PASSIVE_KEY, true)

const { brandingStyle } = useBrandingCssVars()
const giftAidStore = useGiftAidSettingsStore()

// Pre-populate with GBP currency so Gift Aid fields are visible
const previewData = ref({
  currency: 'GBP',
  giftAidConsent: false
})

const previewSection = defineForm('giftAidPreview', () => {
  return createGiftAidFields(true) as Record<string, FieldDef>
})
</script>

<template>
  <div v-if="giftAidStore.enabled" :style="brandingStyle">
    <div class="space-y-4">
      <p class="text-xs text-muted-foreground">Gift Aid section shown on donation form</p>
      <div class="border rounded-lg p-6">
        <FormRenderer
          v-model="previewData"
          :section="previewSection"
          :validate-on-mount="false"
        />
      </div>
    </div>
  </div>
  <PreviewNotAvailable
    v-else
    description="Gift Aid is currently disabled. Enable it in the settings to see the preview."
  />
</template>
