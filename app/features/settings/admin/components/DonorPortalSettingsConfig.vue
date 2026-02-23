<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { useDonorPortalSettingsForm } from '~/features/settings/admin/forms/donor-portal-settings-form'
import { useDonorPortalSettingsStore } from '~/features/settings/admin/stores/donorPortalSettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useDonorPortalSettingsStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useDonorPortalSettingsForm
})

defineEmits<{ save: []; discard: [] }>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      validate-on-mount
      update-only-when-valid
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    />
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />
  </div>
</template>
