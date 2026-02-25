<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { createCampaignConfigMaster, openAccordionId } from '../forms/campaign-config-master'
import { createAdminDonationFormMaster } from '~/features/donation-form/admin/forms/admin-donation-form-master'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

const store = useCampaignConfigStore()
const formConfigStore = useFormConfigStore()

// Provide accordion group with external state sync for preview components
// This must be called in component setup(), not in form definition
provideAccordionGroup(openAccordionId)

// Get forms count for component field validation
const { forms } = useForms(store.id!)
const formsCount = computed(
  () => forms.value.filter((f) => !store.pendingFormDeletes.has(f.id)).length
)

// AUTO-MAPPING: No getData/setData needed! ✨
// Form metadata ($storePath) handles all mapping automatically
const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: createCampaignConfigMaster()
})

// Fundraiser: inline donation amounts from formConfigStore (reuses admin donation form master)
const amountsFormRef = ref()
const amountsSetup = store.isFundraiser
  ? useAdminConfigForm({
      store: formConfigStore,
      form: createAdminDonationFormMaster(() => ({}))
    })
  : null

// Combined dirty state for StickyButtonGroup
const isDirty = computed(() => store.isDirty || (store.isFundraiser && formConfigStore.isDirty))
const isSaving = computed(() => store.isSaving || (store.isFundraiser && formConfigStore.isSaving))
const isValid = computed(() => {
  const campaignValid = formRef.value?.isValid ?? false
  if (!store.isFundraiser) return campaignValid
  const amountsValid = amountsFormRef.value?.isValid ?? false
  return campaignValid && amountsValid
})

// Manually inject formsCount for component field validation
// Component fields are excluded from auto-mapping but need validation data
// donationForms may not exist in auto-mapped data (no mapped fields left), so create it
watch(
  formsCount,
  (count) => {
    if (!modelValue.value.donationForms) {
      ;(modelValue.value as Record<string, unknown>).donationForms = {}
    }
    ;(modelValue.value.donationForms as Record<string, unknown>).formsList = {
      formsCount: count
    }
    // Push into vee-validate's internal state so validation re-runs.
    // FormRenderer clones modelValue on init, so direct mutation above only
    // covers the initial snapshot — setFieldValue handles live updates.
    formRef.value?.setFieldValue('donationForms.formsList', { formsCount: count })
  },
  { immediate: true }
)

defineEmits<{
  save: []
  discard: []
}>()
defineExpose({
  ...expose,
  // Expose amounts form ref for parent discard handling
  amountsResetToSaved: amountsSetup?.expose.resetToSaved
})
</script>

<template>
  <div class="space-y-4">
    <!-- Campaign Config Form -->
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Fundraiser: Inline Donation Amounts (from formConfigStore) -->
    <FormRenderer
      v-if="amountsSetup"
      ref="amountsFormRef"
      v-model="amountsSetup.modelValue.value"
      :section="amountsSetup.form"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save Button -->
    <StickyButtonGroup
      :is-dirty="isDirty"
      :is-saving="isSaving"
      :is-valid="isValid"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
