<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useProductForm, useProductEditForm } from '~/features/products/admin/forms/product-form'
import { productColumns } from '~/features/products/admin/columns/productColumns'
import type { ImpactProduct } from '~/features/products/admin/types'
import { Button } from '@/components/ui/button'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import { Plus, Trash2, Edit } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { products, stats, createProduct, updateProduct, deleteProduct } = useProducts()

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Impact Products' }]

const createForm = useProductForm
const editForm = useProductEditForm

// Create dialog
const showCreateDialog = ref(false)
const createFormRef = ref()
const newProduct = ref({
  name: '',
  description: '',
  icon: '📦',
  frequency: 'once' as const,
  price: undefined as number | undefined,
  minPrice: undefined as number | undefined,
  default: undefined as number | undefined,
  isShippingRequired: false
})

function openCreate() {
  newProduct.value = {
    name: '',
    description: '',
    icon: '📦',
    frequency: 'once',
    price: undefined,
    minPrice: undefined,
    default: undefined,
    isShippingRequired: false
  }
  showCreateDialog.value = true
}

function handleCreate() {
  createProduct(newProduct.value)
  showCreateDialog.value = false
}

// Edit dialog
const showEditDialog = ref(false)
const editFormRef = ref()
const editingProduct = ref<Record<string, unknown>>({})
const editingId = ref<string | null>(null)

function handleEdit(product: ImpactProduct) {
  editingId.value = product.id
  editingProduct.value = {
    name: product.name,
    description: product.description,
    icon: product.icon,
    frequency: product.frequency,
    price: product.price,
    minPrice: product.minPrice,
    default: product.default,
    isShippingRequired: product.isShippingRequired ?? false,
    status: product.status
  }
  showEditDialog.value = true
}

function handleSaveEdit() {
  if (!editingId.value) return
  updateProduct(editingId.value, editingProduct.value as unknown as ImpactProduct)
  showEditDialog.value = false
  editingId.value = null
}

// Delete dialog
const productToDelete = ref<ImpactProduct | null>(null)

function handleDelete(product: ImpactProduct) {
  productToDelete.value = product
}

function confirmDelete() {
  if (productToDelete.value) {
    deleteProduct(productToDelete.value.id)
    productToDelete.value = null
  }
}

const columnsWithActions = computed(() => [
  ...productColumns,
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: { original: ImpactProduct } }) => {
      return h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'h-8 w-8',
            onClick: () => handleEdit(row.original)
          },
          () => h(Edit, { class: 'h-4 w-4' })
        ),
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'h-8 w-8 text-destructive hover:text-destructive',
            onClick: () => handleDelete(row.original)
          },
          () => h(Trash2, { class: 'h-4 w-4' })
        )
      ])
    }
  }
])
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Impact Products" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="openCreate">
            <Plus class="w-4 h-4 mr-2" />
            New Product
          </Button>
        </template>
      </AdminPageHeader>

      <AdminDataTable
        :columns="columnsWithActions"
        :data="products"
        filter-column="name"
        filter-placeholder="Search products..."
      />
    </div>

    <!-- Create Dialog -->
    <BaseDialogOrDrawer
      :open="showCreateDialog"
      description="Create a new product that can be linked to donation forms."
      @update:open="showCreateDialog = $event"
    >
      <template #header>New Impact Product</template>
      <template #content>
        <FormRenderer ref="createFormRef" v-model="newProduct" :section="createForm" />
      </template>
      <template #footer>
        <Button variant="outline" @click="showCreateDialog = false">Cancel</Button>
        <Button :disabled="!newProduct.name" @click="handleCreate">Create Product</Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Edit Dialog -->
    <BaseDialogOrDrawer
      :open="showEditDialog"
      description="Update product details."
      @update:open="showEditDialog = $event"
    >
      <template #header>Edit Product</template>
      <template #content>
        <FormRenderer ref="editFormRef" v-model="editingProduct" :section="editForm" />
      </template>
      <template #footer>
        <Button variant="outline" @click="showEditDialog = false">Cancel</Button>
        <Button @click="handleSaveEdit">Save Changes</Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Delete Dialog -->
    <AdminDeleteDialog
      :open="!!productToDelete"
      title="Delete Product"
      :description="`Are you sure you want to delete &quot;${productToDelete?.name}&quot;? This cannot be undone.`"
      @update:open="(v) => !v && (productToDelete = null)"
      @confirm="confirmDelete"
    />
  </div>
</template>
