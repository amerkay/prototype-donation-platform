<script setup lang="ts">
import { ref } from 'vue'
import AdminConfigPanel from '~/features/_admin/components/AdminConfigPanel.vue'
import { useCertificateTemplateForm } from '~/features/templates/admin/forms/certificate-template-form'
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'

const store = useCertificateTemplateStore()

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
    :form="useCertificateTemplateForm"
    @save="$emit('save')"
    @discard="$emit('discard')"
  />
</template>
