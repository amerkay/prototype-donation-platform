<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import CartProductLine from '~/features/donation-form/impact-cart/ImpactCartProductLine.vue'
import ProductSelectModal from '~/features/donation-form/product/ProductSelectModal.vue'
import type { Product, FormConfig } from '@/lib/common/types'

interface Props {
  frequency: 'once' | 'monthly' | 'yearly'
  currency: string
  price: number
  selectedProduct: Product | null
  products: Product[]
  selectorConfig: FormConfig['features']['productSelector']
  tributeConfig: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'product-select': [product: Product]
  'remove-product': []
  'switch-to-tab': [tab: 'monthly' | 'yearly', openModal?: boolean]
}>()

// Refs
const productModalRef = ref<InstanceType<typeof ProductSelectModal> | null>(null)

// Computed
const productButtonText = computed(() => {
  const { icon, entity, action } = props.selectorConfig.config
  if (props.frequency === 'once') {
    return `${icon} ${action.verb} (Switch to Monthly)`
  }
  return `${icon} ${action.verb} ${entity.singular === entity.plural ? entity.singular : 'an ' + entity.singular}`
})

const selectorProducts = computed(() => {
  return props.products.filter((p) => !p.isReward && p.frequency === props.frequency)
})

const productModalTitle = computed(() => {
  const { icon, entity, action } = props.selectorConfig.config
  return `${icon} ${action.verb} ${entity.singular === entity.plural ? entity.singular : 'an ' + entity.singular}`
})

const productModalDescription = computed(() => {
  const { entity } = props.selectorConfig.config
  return `Choose ${entity.singular === entity.plural ? entity.singular.toLowerCase() : 'an ' + entity.singular.toLowerCase()} to support with a ${props.frequency} donation`
})

const productNoProductsMessage = computed(() => {
  return `No ${props.frequency} ${props.selectorConfig.config.action.noun} products available`
})

const selectedProductIds = computed(() => {
  return props.selectedProduct ? [props.selectedProduct.id] : []
})

// Methods
const handleEditProduct = () => {
  if (props.frequency === 'once') {
    emit('switch-to-tab', 'monthly', true)
  } else {
    productModalRef.value?.open()
  }
}

const handleProductSelect = (product: Product) => {
  emit('product-select', product)
}

const openProductModal = () => {
  productModalRef.value?.open()
}

defineExpose({
  openProductModal
})
</script>

<template>
  <template v-if="selectorConfig.enabled">
    <!-- Product Selector - Show selected product or button -->
    <CartProductLine
      v-if="selectedProduct"
      :item="selectedProduct"
      :currency="currency"
      :price="price"
      :tribute-config="tributeConfig"
      @edit="handleEditProduct"
      @remove="emit('remove-product')"
    />
    <Button
      v-else
      variant="outline"
      class="w-full h-12 text-sm border-2 border-primary/50 hover:border-primary hover:bg-primary/5 font-bold"
      @click="handleEditProduct"
    >
      {{ productButtonText }}
    </Button>

    <!-- Product Select Modal -->
    <ProductSelectModal
      ref="productModalRef"
      :currency="currency"
      :products="selectorProducts"
      :title="productModalTitle"
      :description="productModalDescription"
      :no-products-message="productNoProductsMessage"
      :selected-product-ids="selectedProductIds"
      @select="handleProductSelect"
    />
  </template>
</template>
