<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import { useReceiptTemplateForm } from '~/features/templates/admin/forms/receipt-template-form'
import { useReceiptTemplateStore } from '~/features/templates/admin/stores/receiptTemplate'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-vue-next'

const store = useReceiptTemplateStore()

const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useReceiptTemplateForm
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
    <div class="flex items-center gap-2">
      <StickyButtonGroup
        :is-dirty="store.isDirty"
        :is-saving="store.isSaving"
        :is-valid="formRef?.isValid ?? false"
        @save="$emit('save')"
        @discard="$emit('discard')"
      />
      <Button variant="outline" size="sm" class="lg:hidden" @click="$emit('preview')">
        <Eye class="w-4 h-4 mr-2" />
        Preview
      </Button>
    </div>
  </div>
</template>
