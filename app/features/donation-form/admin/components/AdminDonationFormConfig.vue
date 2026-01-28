<script setup lang="ts">
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/campaigns/admin/components/StickyButtonGroup.vue'
import { createAdminDonationFormMaster } from '~/features/donation-form/admin/forms/admin-donation-form-master'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormContext } from '~/features/donation-form/donor/composables/useDonationFormContext'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useFormConfigStore()

// Get donation form context for custom fields
const { contextSchema: donationContextSchema } = useDonationFormContext()

// AUTO-MAPPING: No getData/setData needed! ✨
// Form metadata ($storePath) handles nested features flattening automatically
const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: createAdminDonationFormMaster(donationContextSchema),
  contextSchema: donationContextSchema
})

defineEmits<{
  save: []
  discard: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Single FormRenderer with all sections as collapsible groups -->
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      :context-schema="donationContextSchema"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save/Discard Buttons -->
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
