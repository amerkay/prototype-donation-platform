<script setup lang="ts">
import { useCertificateTemplateStore } from '~/features/templates/admin/stores/certificateTemplate'
import { useCertificateTemplates } from '~/features/templates/admin/composables/useCertificateTemplates'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const store = useCertificateTemplateStore()
const { getDeleteProtection } = useCertificateTemplates()
const { products, updateProduct } = useProducts()

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

const linkedProducts = computed(() =>
  products.value.filter((p) => {
    if (store.pendingProductUnlinks.has(p.id)) return false
    if (store.pendingProductLinks.has(p.id)) return true
    return p.certificateTemplateId === store.id
  })
)

const deleteProtection = computed(() =>
  store.id ? getDeleteProtection(store.id) : { canDelete: false, reason: 'Template not found' }
)

// Status change confirmation
const showStatusChangeDialog = ref(false)
const pendingStatus = ref<string | null>(null)

function handleStatusChange(newStatus: string) {
  // If changing to archived and there are linked products, show confirmation
  if (newStatus === 'archived' && linkedProductCount.value > 0) {
    pendingStatus.value = newStatus
    showStatusChangeDialog.value = true
  } else {
    emit('update:status', newStatus)
  }
}

function confirmStatusChange() {
  if (!pendingStatus.value) return

  // Clear certificate associations from all linked products
  linkedProducts.value.forEach((product) => {
    updateProduct(product.id, {
      certificateTemplateId: undefined,
      certificateOverrideName: undefined,
      certificateText: undefined
    })
  })

  // Clear pending links/unlinks in store
  store.pendingProductLinks.clear()
  store.pendingProductUnlinks.clear()

  emit('update:status', pendingStatus.value)
  showStatusChangeDialog.value = false
  pendingStatus.value = null
}

function cancelStatusChange() {
  showStatusChangeDialog.value = false
  pendingStatus.value = null
}
</script>

<template>
  <AdminResourceHeader>
    <template #left>
      <InlineEditableText
        :model-value="store.name"
        display-class="text-lg font-bold"
        class="min-w-0"
        :max-length="75"
        @update:model-value="emit('update:name', $event)"
      />
      <AdminStatusSelect
        :model-value="store.status ?? 'active'"
        :options="STATUS_OPTIONS"
        @update:model-value="handleStatusChange"
      />
    </template>
    <template #right>
      <AdminDeleteButton
        :entity-name="store.name"
        entity-type="Certificate Template"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>

  <AlertDialog v-model:open="showStatusChangeDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Clear Product Associations?</AlertDialogTitle>
        <AlertDialogDescription>
          Archiving this certificate template will clear all product associations. This will affect
          {{ linkedProductCount }} product{{ linkedProductCount !== 1 ? 's' : '' }}. <br /><br />
          Are you sure you want to continue?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="cancelStatusChange">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="confirmStatusChange"
          >Archive & Clear Associations</AlertDialogAction
        >
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
