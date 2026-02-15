<script setup lang="ts">
import { ref } from 'vue'
import AdminConfigPanel from '~/features/_admin/components/AdminConfigPanel.vue'
import { useEmailTemplateForm } from '~/features/templates/admin/forms/email-template-form'
import { useEmailTemplateStore } from '~/features/templates/admin/stores/emailTemplate'

const store = useEmailTemplateStore()
const configRef = ref<InstanceType<typeof AdminConfigPanel> | null>(null)

defineEmits<{ save: []; discard: [] }>()
defineExpose({
  get isValid() {
    return configRef.value?.isValid ?? false
  },
  resetToSaved: () => configRef.value?.resetToSaved()
})
</script>

<template>
  <AdminConfigPanel
    ref="configRef"
    :store="store"
    :form="useEmailTemplateForm"
    @save="$emit('save')"
    @discard="$emit('discard')"
  />
</template>
