<script setup lang="ts">
import { ref } from 'vue'
import AdminConfigPanel from '~/features/_admin/components/AdminConfigPanel.vue'
import { useECardTemplateForm } from '~/features/templates/admin/forms/ecard-template-form'
import { useEcardTemplateStore } from '~/features/templates/admin/stores/ecardTemplate'

const store = useEcardTemplateStore()
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
    :form="useECardTemplateForm"
    @save="$emit('save')"
    @discard="$emit('discard')"
  />
</template>
