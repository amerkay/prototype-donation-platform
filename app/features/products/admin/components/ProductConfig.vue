<script setup lang="ts">
import { ref } from 'vue'
import AdminConfigPanel from '~/features/_admin/components/AdminConfigPanel.vue'
import { useProductForm } from '~/features/products/admin/forms/product-form'
import { useProductStore } from '~/features/products/admin/stores/product'

const store = useProductStore()
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
    :form="useProductForm"
    @save="$emit('save')"
    @discard="$emit('discard')"
  />
</template>
