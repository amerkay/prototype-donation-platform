<script setup lang="ts">
import type { Product } from '@/lib/common/types'
import BaseDialogOrDrawer from '@/components/donation-form/common/BaseDialogOrDrawer.vue'
import ProductCard from '@/components/donation-form/cart/ProductCard.vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Search } from 'lucide-vue-next'

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

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:searchQuery': [value: string]
  'update:showAllProducts': [value: boolean]
  'product-select': [product: Product]
}>()

const displayedProducts = computed(() => {
  if (props.showAllProducts || props.searchQuery.trim()) {
    return props.products
  }
  return props.products.slice(0, props.initialProductsDisplayed)
})

const hasMoreProducts = computed(() => {
  return (
    !props.showAllProducts &&
    !props.searchQuery.trim() &&
    props.products.length > props.initialProductsDisplayed
  )
})

const handleProductClick = (product: Product) => {
  emit('product-select', product)
}

const handleShowMore = () => {
  emit('update:showAllProducts', true)
}

const handleSearchUpdate = (value: string | number) => {
  emit('update:searchQuery', String(value))
}
</script>

<template>
  <BaseDialogOrDrawer :open="open" :dismissible="true" @update:open="emit('update:open', $event)">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ config.title }}</h2>
    </template>
    <template #content>
      <div class="space-y-4">
        <!-- Search Input -->
        <div class="relative">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search class="size-4" />
          </span>
          <Input
            :model-value="searchQuery"
            type="text"
            :placeholder="config.searchPlaceholder"
            class="h-10 pl-10"
            @update:model-value="handleSearchUpdate"
          />
        </div>

        <!-- Products Grid -->
        <TransitionGroup
          v-if="displayedProducts.length > 0"
          name="product-list"
          tag="div"
          class="space-y-2 max-h-96 overflow-y-auto"
        >
          <ProductCard
            v-for="product in displayedProducts"
            :key="product.id"
            :product="product"
            :currency="currency"
            @click="handleProductClick(product)"
          />
        </TransitionGroup>

        <!-- Empty State -->
        <Empty v-else class="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>
              {{ config.emptyStateMessage.replace('{query}', searchQuery) }}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>

        <!-- Show More Button -->
        <Button v-if="hasMoreProducts" variant="outline" class="w-full" @click="handleShowMore">
          {{
            config.showMoreButton.replace(
              '{count}',
              String(products.length - initialProductsDisplayed)
            )
          }}
        </Button>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>

<style scoped>
.product-list-enter-active {
  transition: all 0.4s ease-out;
}

.product-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.product-list-move {
  transition: transform 0.4s ease;
}
</style>
