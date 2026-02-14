<script setup lang="ts">
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'

const store = useCertificateTemplateStore()
const { products } = useProducts()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:status': [value: string]
  deleted: []
}>()

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' }
]

// Effective linked products: same logic as CertificateProductAssignment
const linkedProductCount = computed(
  () =>
    products.value.filter((p) => {
      if (store.pendingProductUnlinks.has(p.id)) return false
      if (store.pendingProductLinks.has(p.id)) return true
      return p.certificateTemplateId === store.id
    }).length
)

/** Stub: will check if any donations reference this certificate template */
const hasDonations = computed(() => false)

const deleteDisabled = computed(() => hasDonations.value || linkedProductCount.value > 0)
const deleteDisabledReason = computed(() => {
  if (hasDonations.value) return 'Cannot delete a template that has been used in donations'
  if (linkedProductCount.value > 0) {
    const n = linkedProductCount.value
    return `Linked to ${n} product${n !== 1 ? 's' : ''} — unlink or archive instead`
  }
  return undefined
})
</script>

<template>
  <AdminResourceHeader>
    <template #left>
      <InlineEditableText
        :model-value="store.name"
        display-class="text-lg font-bold"
        class="min-w-0"
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
        entity-type="Certificate Template"
        :disabled="deleteDisabled"
        :disabled-reason="deleteDisabledReason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>
</template>
