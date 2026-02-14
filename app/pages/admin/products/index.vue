<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import ProductCard from '~/features/products/admin/components/ProductCard.vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const { products, stats, createProduct, duplicateProduct, updateProductName, deleteProduct } =
  useProducts()

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Impact Products' }]

function handleNew() {
  const id = createProduct({})
  navigateTo(`/admin/products/${id}`)
}

function handleDuplicate(id: string) {
  const newId = duplicateProduct(id)
  if (newId) navigateTo(`/admin/products/${newId}`)
}

function handleRename(id: string, name: string) {
  updateProductName(id, name)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Impact Products" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="handleNew">
            <Plus class="w-4 h-4 mr-2" />
            New Product
          </Button>
        </template>
      </AdminPageHeader>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @rename="handleRename(product.id, $event)"
          @duplicate="handleDuplicate(product.id)"
          @delete="deleteProduct(product.id)"
        />
      </div>

      <div v-if="!products.length" class="text-center py-12 text-muted-foreground">
        <p class="text-lg font-medium">No products yet</p>
        <p class="text-sm mt-1">Create your first impact product to get started.</p>
      </div>
    </div>
  </div>
</template>
