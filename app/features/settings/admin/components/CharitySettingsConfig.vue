<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import DevJsonPreview from '~/features/_admin/components/DevJsonPreview.vue'
import { useCharitySettingsForm } from '~/features/settings/admin/forms/charity-settings-form'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useCharitySettingsStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useCharitySettingsForm
})

defineEmits<{
  save: []
  discard: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer ref="formRef" v-model="modelValue" :section="form" validate-on-mount />

    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    />

    <DevJsonPreview :data="store.$state" />
  </div>
</template>
