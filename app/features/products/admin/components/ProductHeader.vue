<script setup lang="ts">
import { useProductStore } from '~/features/products/admin/stores/product'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'

const store = useProductStore()
const { getDeleteProtection } = useProducts()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:status': [value: string]
  deleted: []
}>()

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

const deleteProtection = computed(() =>
  store.id ? getDeleteProtection(store.id) : { canDelete: false, reason: 'Product not found' }
)
</script>

<template>
  <AdminResourceHeader>
    <template #left>
      <InlineEditableText
        :model-value="store.name"
        display-class="text-lg font-bold"
        class="min-w-0"
        :max-length="35"
        @update:model-value="emit('update:name', $event)"
      />
      <AdminStatusSelect
        :model-value="store.status ?? 'active'"
        :options="STATUS_OPTIONS"
        @update:model-value="emit('update:status', $event)"
      />
    </template>
    <template #right>
      <AdminDeleteButton
        :entity-name="store.name"
        entity-type="Product"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>
</template>
