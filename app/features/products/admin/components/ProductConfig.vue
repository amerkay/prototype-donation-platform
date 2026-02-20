<script setup lang="ts">
import { ref } from 'vue'
import AdminConfigPanel from '~/features/_admin/components/AdminConfigPanel.vue'
import {
  useProductForm,
  productOpenAccordionId
} from '~/features/products/admin/forms/product-form'
import { useProductStore } from '~/features/products/admin/stores/product'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'

const store = useProductStore()
provideAccordionGroup(productOpenAccordionId)
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
