<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import {
  useCertificateTemplateForm,
  certificateOpenAccordionId
} from '~/features/templates/admin/forms/certificate-template-form'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

const store = useCertificateTemplateStore()

provideAccordionGroup(certificateOpenAccordionId)

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useCertificateTemplateForm
})

defineEmits<{ save: []; discard: []; preview: [] }>()
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
