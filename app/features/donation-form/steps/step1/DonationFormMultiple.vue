<script setup lang="ts">
import { ref, computed } from 'vue'
import ImpactCart from '~/features/donation-form/impact-cart/ImpactCart.vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import ImpactJourneyCard from '~/features/donation-form/impact-journey/ImpactJourneyCard.vue'
import ShippingNotice from '~/features/donation-form/shipping-notice/ShippingNotice.vue'
import ProductOptionsModal from '~/features/donation-form/product/ProductOptionsModal.vue'
import type { Product } from '~/features/donation-form/product/types'
import type { FullFormConfig } from '~/stores/formConfig'
import type { CartItem } from '~/features/donation-form/impact-cart/types'
import type { TributeData } from '~/features/donation-form/tribute/types'
import { getCartItemKey, parseCartItemKey } from '~/features/donation-form/impact-cart/cart-utils'
import { useImpactCartStore } from '~/features/donation-form/impact-cart/stores/impactCart'

const cartStore = useImpactCartStore()

interface Props {
  currency: string
  products: Product[]
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  initialProductsDisplayed: number
  formConfig: FullFormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly']
}>()

const cartRef = ref<InstanceType<typeof ImpactCart> | null>(null)
const productOptionsModalRef = ref<InstanceType<typeof ProductOptionsModal> | null>(null)
const formContainerRef = ref<HTMLElement | null>(null)

// Computed
const filteredProducts = computed(() => {
  let regularProducts = props.products.filter((p) => !p.isReward)
  const locked = cartStore.activeRecurringFrequency
  if (locked) {
    regularProducts = regularProducts.filter(
      (p) => p.frequency === 'once' || p.frequency === locked
    )
  }
  return regularProducts
})

const activeCartTotal = computed(() => cartStore.cartTotal('multiple'))
const isFormValid = computed(() => cartStore.multipleCart.length > 0)

// Methods
const handleSwitchToTab = (tab: 'monthly' | 'yearly') => {
  emit('switch-to-tab', tab)
}

const handleEditCartItem = (item: CartItem, itemKey: string) => {
  productOptionsModalRef.value?.openForEdit(item, itemKey)
}

const handleRemoveCartItem = (itemId: string, addedAt: number) => {
  cartStore.removeFromCart(itemId, addedAt, 'multiple')
}

const handleProductSelect = (product: Product) => {
  const price = product.default ?? product.price ?? 0
  productOptionsModalRef.value?.openForAdd(product, price)
}

const handleProductModalConfirm = (
  product: Product,
  price: number,
  quantity: number,
  mode: 'add' | 'edit',
  itemKey?: string,
  tribute?: TributeData
) => {
  if (mode === 'add') {
    const cartItem = cartStore.addToCart(product, price, 'multiple', quantity, tribute)
    const newItemKey = getCartItemKey(cartItem.id, cartItem.addedAt)
    cartRef.value?.triggerPulse(newItemKey)
  } else if (mode === 'edit' && itemKey) {
    const parsed = parseCartItemKey(itemKey)
    if (parsed) {
      cartStore.updateCartItemPrice(parsed.itemId, parsed.addedAt, price, 'multiple')
      cartStore.updateCartItemQuantity(parsed.itemId, parsed.addedAt, quantity, 'multiple')
      if (tribute) {
        cartStore.updateCartItemTribute(parsed.itemId, parsed.addedAt, tribute, 'multiple')
      }
    }
  }
}

// Expose cartRef method for parent to trigger pulse
defineExpose({
  triggerPulse: (itemKey: string) => {
    cartRef.value?.triggerPulse(itemKey)
  }
})
</script>

<template>
  <div ref="formContainerRef" class="space-y-4">
    <!-- ImpactCart Component -->
    <ImpactCart
      ref="cartRef"
      :items="cartStore.multipleCart"
      :currency="currency"
      :base-currency="formConfig.pricing.baseCurrency"
      :total="activeCartTotal"
      :recurring-total="cartStore.recurringTotal"
      :show-total="true"
      :products="filteredProducts"
      :initial-products-displayed="initialProductsDisplayed"
      :tribute-config="formConfig.features.tribute"
      @edit="handleEditCartItem"
      @remove="handleRemoveCartItem"
      @product-select="handleProductSelect"
    />

    <!-- Impact Journey -->
    <ImpactJourneyCard
      v-if="formConfig.features.impactJourney.enabled"
      frequency="multiple"
      :donation-amount="cartStore.recurringTotal"
      :currency="currency"
      :base-currency="formConfig.pricing.baseCurrency"
      :config="formConfig.features.impactJourney"
      :enabled-frequencies="enabledFrequencies"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Shipping Notice -->
    <ShippingNotice
      :requires-shipping="cartStore.multipleCart.some((item) => item.isShippingRequired)"
    />

    <!-- Next Button -->
    <NextButton
      :disabled="!isFormValid"
      :parent-container-ref="formContainerRef"
      @click="emit('next')"
    />

    <!-- Product Configuration Modal -->
    <ProductOptionsModal
      ref="productOptionsModalRef"
      :currency="currency"
      :base-currency="formConfig.pricing.baseCurrency"
      :pricing-config="formConfig.pricing.frequencies"
      :tribute-config="formConfig.features.tribute"
      @confirm="handleProductModalConfirm"
    />
  </div>
</template>
