<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { useAfterSaleSettingsForm } from '~/features/settings/admin/forms/after-sale-settings-form'
import { useAfterSaleSettingsStore } from '~/features/settings/admin/stores/afterSaleSettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useAfterSaleSettingsStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useAfterSaleSettingsForm
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
