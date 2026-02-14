<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import type { EditableStore } from '~/features/_admin/composables/useAdminEdit'
import type { ComposableForm } from '~/features/_library/form-builder/types'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const props = defineProps<{
  store: EditableStore
  form: ComposableForm
}>()

const emit = defineEmits<{ save: []; discard: [] }>()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store: props.store,
  form: props.form
})

defineExpose({
  get isValid() {
    return expose.isValid.value
  },
  resetToSaved: expose.resetToSaved
})
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
      @save="emit('save')"
      @discard="emit('discard')"
    />
  </div>
</template>
