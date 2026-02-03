<script setup lang="ts">
import type { Component } from 'vue'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import CrowdfundingPagePreview from './CrowdfundingPagePreview.vue'
import SharingPreview from './SharingPreview.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-vue-next'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useForms } from '~/features/campaigns/shared/composables/useForms'

const store = useCampaignConfigStore()
const formConfigStore = useFormConfigStore()

// Initialize form config store with default form for donation forms preview
const { defaultForm } = useForms(store.id!)
if (defaultForm.value) {
  formConfigStore.initialize(
    defaultForm.value.config,
    defaultForm.value.products,
    defaultForm.value.id
  )
}

// Map accordion IDs to preview components
const previewComponents: Record<string, Component> = {
  donationForms: DonationFormPreview,
  crowdfunding: CrowdfundingPagePreview,
  socialSharing: SharingPreview
}

// Compute which preview to show
const currentPreview = computed(() => {
  const accordionId = openAccordionId.value

  if (!accordionId) return null

  // Extract field name from full path (e.g., "campaignConfigMaster.crowdfunding" -> "crowdfunding")
  const fieldName = accordionId.split('.').pop()

  // Direct match with extracted field name
  if (fieldName && fieldName in previewComponents) {
    return fieldName
  }

  return null
})

// Check if current section is disabled
const isCurrentSectionDisabled = computed(() => {
  const preview = currentPreview.value
  if (!preview) return false

  // Check if the feature is disabled
  if (preview === 'crowdfunding') {
    return store.crowdfunding?.enabled === false
  }
  if (preview === 'socialSharing') {
    return store.socialSharing?.enabled === false
  }

  return false
})

// Get feature name for display
const featureName = computed(() => {
  const preview = currentPreview.value
  if (preview === 'crowdfunding') return 'Crowdfunding Page'
  if (preview === 'socialSharing') return 'Social Sharing'
  return 'This feature'
})

// Show default message when no preview available and not disabled
const showDefaultMessage = computed(() => !currentPreview.value)
const showDisabledMessage = computed(() => currentPreview.value && isCurrentSectionDisabled.value)
</script>

<template>
  <div>
    <!-- Dynamic Preview -->
    <component
      :is="previewComponents[currentPreview!]"
      v-if="currentPreview && !isCurrentSectionDisabled"
    />

    <!-- Disabled Message -->
    <Card v-if="showDisabledMessage">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Info class="w-5 h-5" />
          Preview Unavailable
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          {{ featureName }} is currently disabled. Enable it in the settings to see the preview.
        </p>
      </CardContent>
    </Card>

    <!-- Default Message -->
    <Card v-if="showDefaultMessage">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Info class="w-5 h-5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          Expand a section to see its preview here. Available previews:
        </p>
        <ul class="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
          <li>Donation Forms - preview the default donation form</li>
          <li>Crowdfunding Page - see how your public page will look</li>
          <li>Social Sharing - preview share buttons and content</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
