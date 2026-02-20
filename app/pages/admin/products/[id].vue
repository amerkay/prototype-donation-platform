<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import ProductConfig from '~/features/products/admin/components/ProductConfig.vue'
import ProductPreview from '~/features/products/admin/components/ProductPreview.vue'
import ProductHeader from '~/features/products/admin/components/ProductHeader.vue'
import { useProductStore } from '~/features/products/admin/stores/product'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getProductById, updateProductName, updateProductStatus, deleteProduct } = useProducts()
const store = useProductStore()

const product = computed(() => getProductById(route.params.id as string))

// Initialize store synchronously
if (product.value) {
  store.initialize(product.value)
}

onMounted(() => {
  if (!product.value) {
    navigateTo('/admin/products')
  }
})

// Watch for route param changes
watch(
  () => route.params.id,
  (newId) => {
    const p = getProductById(newId as string)
    if (p) store.initialize(p)
  }
)

const originalData = computed(() => (store.id ? store.toSnapshot() : undefined))

const formConfigRef = ref()

const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    store.save()
  }
})

const editableMode = ref(true)

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Impact Products', href: '/admin/products' },
  { label: store.name || 'Untitled' }
])

function handleNameUpdate(newName: string) {
  if (!store.id) return
  store.name = newName
  updateProductName(store.id, newName)
}

function handleStatusUpdate(newStatus: string) {
  if (!store.id) return
  store.status = newStatus as 'active' | 'archived'
  updateProductStatus(store.id, store.status)
}

function handleDeleted() {
  if (!store.id) return
  deleteProduct(store.id)
  navigateTo('/admin/products')
}
</script>

<template>
  <div v-if="product">
    <AdminEditLayout
      v-model:editable="editableMode"
      :breadcrumbs="breadcrumbs"
      :is-dirty="store.isDirty"
      :show-discard-dialog="showDiscardDialog"
      editable-last-item
      :max-length="35"
      @update:show-discard-dialog="showDiscardDialog = $event"
      @confirm-discard="confirmDiscard"
      @update:last-item-label="handleNameUpdate"
    >
      <template #header>
        <ProductHeader
          @update:name="handleNameUpdate"
          @update:status="handleStatusUpdate"
          @deleted="handleDeleted"
        />
      </template>

      <template #content>
        <div class="space-y-6">
          <ProductConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
        </div>
      </template>

      <template #preview-label>Product Preview</template>

      <template #preview>
        <ProductPreview :editable="editableMode" />
      </template>
    </AdminEditLayout>
  </div>
</template>
