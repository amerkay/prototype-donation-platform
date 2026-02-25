<script setup lang="ts">
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import DonationFormTemplateGrid from '~/features/donation-form/admin/components/DonationFormTemplateGrid.vue'

defineProps<{
  open: boolean
  campaignId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [template: DonationFormTemplate]
}>()

const handleTemplateSelect = (template: DonationFormTemplate) => {
  emit('select', template)
  emit('update:open', false)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="open"
    size="xl"
    dismissible
    description="Select a template to create a new form for your campaign"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <span>Choose a Form Template</span>
    </template>

    <template #content>
      <DonationFormTemplateGrid @select="handleTemplateSelect" />
    </template>
  </BaseDialogOrDrawer>
</template>
