<script setup lang="ts">
import type { Component } from 'vue'
import { useAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'
import CrowdfundingPagePreview from './CrowdfundingPagePreview.vue'
import SharingPreview from './SharingPreview.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-vue-next'

// Get the currently open accordion ID from shared state
const { getOpenAccordionId } = useAccordionGroup()
const openAccordionId = getOpenAccordionId()

// Map accordion IDs to preview components
const previewComponents: Record<string, Component> = {
  crowdfunding: CrowdfundingPagePreview,
  socialSharing: SharingPreview
}

// Compute which preview to show
const currentPreview = computed(() => {
  const accordionId = openAccordionId.value
  if (!accordionId) return null

  // Map field group IDs to preview IDs
  if (accordionId === 'crowdfunding') return 'crowdfunding'
  if (accordionId === 'socialSharing') return 'socialSharing'
  return null
})

// Show default message when no preview available
const showDefaultMessage = computed(() => !currentPreview.value)
</script>

<template>
  <div>
    <!-- Dynamic Preview -->
    <component :is="previewComponents[currentPreview!]" v-if="currentPreview" />

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
          <li>Crowdfunding Page - see how your public page will look</li>
          <li>Social Sharing - preview share buttons and content</li>
        </ul>
      </CardContent>
    </Card>
  </div>
</template>
