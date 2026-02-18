<script setup lang="ts">
import { ref } from 'vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import ProductCard from '~/features/donation-form/features/product/donor/components/ProductCard.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'

interface Props {
  currency: string
  baseCurrency?: string
  products: Product[]
  title: string
  description: string
  noProductsMessage: string
  selectedProductIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  selectedProductIds: () => []
})

const emit = defineEmits<{
  select: [product: Product]
}>()

const brandingStyle = useInjectedBrandingStyle()
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
  <BaseDialogOrDrawer
    v-model:open="isOpen"
    :dismissible="true"
    :description="description"
    :content-style="brandingStyle"
  >
    <template #header>
      <h2 class="text-2xl font-semibold">{{ title }}</h2>
    </template>
    <template #content>
      <div class="space-y-2 max-h-96 overflow-y-auto">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :currency="currency"
          :base-currency="baseCurrency"
          icon="lucide:check"
          :active="props.selectedProductIds.includes(product.id)"
          @click="handleSelect(product)"
        />
        <div v-if="products.length === 0" class="py-12 text-center text-muted-foreground">
          {{ noProductsMessage }}
        </div>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
