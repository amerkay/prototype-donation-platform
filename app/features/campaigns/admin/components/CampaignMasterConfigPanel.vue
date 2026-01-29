<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from './StickyButtonGroup.vue'
import { createCampaignConfigMaster, openAccordionId } from '../forms/campaign-config-master'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

const store = useCampaignConfigStore()

// Provide accordion group with external state sync for preview components
// This must be called in component setup(), not in form definition
provideAccordionGroup(openAccordionId)

// Get forms count for component field validation
const { forms } = useForms(store.id!)
const formsCount = computed(() => forms.value.length)

// AUTO-MAPPING: No getData/setData needed! ✨
// Form metadata ($storePath) handles all mapping automatically
const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: createCampaignConfigMaster()
})

// Manually inject formsCount for component field validation
// Component fields are excluded from auto-mapping but need validation data
watch(
  formsCount,
  (count) => {
    if (modelValue.value.basicSettings) {
      ;(modelValue.value.basicSettings as Record<string, unknown>).formsList = {
        formsCount: count
      }
    }
  },
  { immediate: true }
)

defineEmits<{
  save: []
  discard: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="space-y-4">
    <!-- Form Renderer -->
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save Button -->
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
