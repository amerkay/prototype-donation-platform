<script setup lang="ts">
import type { Product } from '@/lib/common/types'
import BaseDialogOrDrawer from '@/components/donation-form/common/BaseDialogOrDrawer.vue'
import ProductListContent from '@/components/donation-form/cart/ProductListContent.vue'

interface Props {
  open: boolean
  products: Product[]
  currency: string
  searchQuery: string
  showAllProducts: boolean
  initialProductsDisplayed: number
  config: {
    title: string
    searchPlaceholder: string
    showMoreButton: string
    emptyStateMessage: string
  }
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:searchQuery': [value: string]
  'update:showAllProducts': [value: boolean]
  'product-select': [product: Product]
}>()
</script>

<template>
  <BaseDialogOrDrawer :open="open" :dismissible="true" @update:open="emit('update:open', $event)">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ config.title }}</h2>
    </template>
    <template #content>
      <ProductListContent
        :products="products"
        :currency="currency"
        :search-query="searchQuery"
        :show-all-products="showAllProducts"
        :initial-products-displayed="initialProductsDisplayed"
        :config="config"
        @update:search-query="emit('update:searchQuery', $event)"
        @update:show-all-products="emit('update:showAllProducts', $event)"
        @product-select="emit('product-select', $event)"
      />
    </template>
  </BaseDialogOrDrawer>
</template>
