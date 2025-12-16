<script setup lang="ts">
import { ref } from 'vue'
import BaseDialogOrDrawer from '~/features/donation-form/components/BaseDialogOrDrawer.vue'
import ProductCard from '~/features/donation-form/product/ProductCard.vue'
import type { Product } from '@/lib/common/types'

interface Props {
  currency: string
  products: Product[]
  title: string
  description: string
  noProductsMessage: string
}

defineProps<Props>()

const emit = defineEmits<{
  select: [product: Product]
}>()

const isOpen = ref(false)

const handleSelect = (product: Product) => {
  emit('select', product)
  isOpen.value = false
}

defineExpose({
  open: () => {
    isOpen.value = true
  }
})
</script>

<template>
  <BaseDialogOrDrawer v-model:open="isOpen" :dismissible="true">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
      <p class="text-sm text-muted-foreground">
        {{ description }}
      </p>
    </template>
    <template #content>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :currency="currency"
          @click="handleSelect(product)"
        />
        <div v-if="products.length === 0" class="py-12 text-center text-muted-foreground">
          {{ noProductsMessage }}
        </div>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
