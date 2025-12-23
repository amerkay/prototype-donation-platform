<script setup lang="ts">
import { ref, computed } from 'vue'
import ImpactCart from '~/features/donation-form/impact-cart/ImpactCart.vue'
import NextButton from '~/features/donation-form/components/NextButton.vue'
import RewardsSection from '~/features/donation-form/rewards/RewardsSection.vue'
import ShippingNotice from '~/features/donation-form/shipping-notice/ShippingNotice.vue'
import ProductOptionsModal from '~/features/donation-form/product/ProductOptionsModal.vue'
import type { Product, CartItem, TributeData, FormConfig } from '@/lib/common/types'
import { getCartItemKey, parseCartItemKey } from '~/features/donation-form/impact-cart/cart-utils'
import { useImpactCartStore } from '~/features/donation-form/impact-cart/stores/impactCart'

const cartStore = useImpactCartStore()

interface Props {
  currency: string
  rewards: Product[]
  products: Product[]
  selectedRewards: Set<string>
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  initialProductsDisplayed: number
  formConfig: FormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-reward': [itemId: string]
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

    <!-- Rewards Section -->
    <RewardsSection
      :rewards="rewards"
      :selected-rewards="selectedRewards"
      :one-time-total="cartStore.oneTimeTotal"
      :monthly-total="cartStore.monthlyTotal"
      :yearly-total="cartStore.yearlyTotal"
      :enabled-frequencies="enabledFrequencies"
      :currency="currency"
      :base-currency="formConfig.pricing.baseCurrency"
      selected-frequency="multiple"
      :rewards-config="formConfig.features.rewards"
      @toggle="emit('toggle-reward', $event)"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Shipping Notice -->
    <ShippingNotice
      :requires-shipping="
        cartStore.multipleCart.some((item) => item.isShippingRequired) ||
        Array.from(selectedRewards).some(
          (id) => products.find((p) => p.id === id)?.isShippingRequired
        )
      "
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
