<script setup lang="ts">
import type { Component } from 'vue'
import CrowdfundingPagePreview from './CrowdfundingPagePreview.vue'
import SharingPreview from './SharingPreview.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Eye, EyeOff, FileText } from 'lucide-vue-next'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useCampaignPreview } from '~/features/campaigns/shared/composables/useCampaignPreview'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'

const store = useCampaignConfigStore()
const formConfigStore = useFormConfigStore()

const { activeSection, hasActivePreview, isDisabled, isEmpty, featureName, defaultForm } =
  useCampaignPreview(store.id!)
const { brandingStyle } = useBrandingCssVars()

// Sync form config store with default form for donation forms preview
watch(
  defaultForm,
  (form) => {
    if (form) {
      formConfigStore.initialize(form.config, form.products, form.id)
    }
  },
  { immediate: true }
)

// Map accordion IDs to preview components
const previewComponents: Record<string, Component> = {
  donationForms: DonationFormPreview,
  crowdfunding: CrowdfundingPagePreview,
  socialSharing: SharingPreview
}

// Scroll parent container to top when preview changes
const containerRef = ref<HTMLElement>()
watch(activeSection, async () => {
  await nextTick()
  containerRef.value?.parentElement?.scrollTo({ top: 0, behavior: 'smooth' })
})
</script>

<template>
  <div ref="containerRef" :style="brandingStyle">
    <!-- Dynamic Preview -->
    <component :is="previewComponents[activeSection!]" v-if="hasActivePreview" />

    <!-- Form Empty State -->
    <Empty v-else-if="isEmpty" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>No Form Preview</EmptyTitle>
        <EmptyDescription> Add at least one donation form to see a preview here. </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Disabled Message -->
    <Empty v-else-if="isDisabled" class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <EyeOff />
        </EmptyMedia>
        <EmptyTitle>Preview Unavailable</EmptyTitle>
        <EmptyDescription>
          {{ featureName }} is currently disabled. Enable it in the settings to see the preview.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>

    <!-- Default Message -->
    <Empty v-else class="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Eye />
        </EmptyMedia>
        <EmptyTitle>Preview</EmptyTitle>
        <EmptyDescription> Expand a section on the left to see its preview here. </EmptyDescription>
      </EmptyHeader>
    </Empty>
  </div>
</template>
