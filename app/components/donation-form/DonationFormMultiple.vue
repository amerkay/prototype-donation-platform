<script setup lang="ts">
import { ref, computed } from 'vue'
import Cart from '@/components/donation-form/cart/Cart.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import BonusItemsSection from '~/components/donation-form/common/BonusItemsSection.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import ProductOptionsModal from '~/components/donation-form/product/ProductOptionsModal.vue'
import type { Product, CartItem, TributeData } from '@/lib/common/types'
import { getCartItemKey, parseCartItemKey } from '@/lib/common/cart-utils'

const {
  multipleCart,
  selectedBonusItems,
  cartTotal,
  recurringTotal,
  oneTimeTotal,
  monthlyTotal,
  yearlyTotal,
  activeRecurringFrequency,
  toggleBonusItem,
  addToCart,
  updateCartItemPrice,
  updateCartItemQuantity,
  updateCartItemTribute,
  removeFromCart
} = useCart()

interface Props {
  currency: string
  bonusItems: Product[]
  products: Product[]
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  initialProductsDisplayed: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountsConfig: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly']
}>()

const cartRef = ref<InstanceType<typeof Cart> | null>(null)
const productOptionsModalRef = ref<InstanceType<typeof ProductOptionsModal> | null>(null)

// Computed
const filteredProducts = computed(() => {
  let regularProducts = props.products.filter((p) => !p.isBonusItem)
  const locked = activeRecurringFrequency.value
  if (locked) {
    regularProducts = regularProducts.filter(
      (p) => p.frequency === 'once' || p.frequency === locked
    )
  }
  return regularProducts
})

const activeCartTotal = computed(() => cartTotal('multiple'))
const isFormValid = computed(() => multipleCart.value.length > 0)

// Methods
const handleSwitchToTab = (tab: 'monthly' | 'yearly') => {
  emit('switch-to-tab', tab)
}

const handleEditCartItem = (item: CartItem, itemKey: string) => {
  productOptionsModalRef.value?.openForEdit(item, itemKey)
}

const handleRemoveCartItem = (itemId: string, addedAt: number) => {
  removeFromCart(itemId, addedAt, 'multiple')
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
    const cartItem = addToCart(product, price, 'multiple', quantity, tribute)
    const newItemKey = getCartItemKey(cartItem.id, cartItem.addedAt)
    cartRef.value?.triggerPulse(newItemKey)
  } else if (mode === 'edit' && itemKey) {
    const parsed = parseCartItemKey(itemKey)
    if (parsed) {
      updateCartItemPrice(parsed.itemId, parsed.addedAt, price, 'multiple')
      updateCartItemQuantity(parsed.itemId, parsed.addedAt, quantity, 'multiple')
      if (tribute) {
        updateCartItemTribute(parsed.itemId, parsed.addedAt, tribute, 'multiple')
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
  <div class="space-y-4">
    <!-- Cart Component -->
    <Cart
      ref="cartRef"
      :items="multipleCart"
      :currency="currency"
      :total="activeCartTotal"
      :recurring-total="recurringTotal"
      :show-total="true"
      :products="filteredProducts"
      :initial-products-displayed="initialProductsDisplayed"
      :product-list-config="config.multipleItemsSection"
      @edit="handleEditCartItem"
      @remove="handleRemoveCartItem"
      @product-select="handleProductSelect"
    />

    <!-- Bonus Items Section -->
    <BonusItemsSection
      :bonus-items="bonusItems"
      :selected-bonus-items="selectedBonusItems"
      :one-time-total="oneTimeTotal"
      :monthly-total="monthlyTotal"
      :yearly-total="yearlyTotal"
      :enabled-frequencies="enabledFrequencies"
      :currency="currency"
      selected-frequency="multiple"
      :free-gifts-label="config.bonusItemsSection.freeGiftsLabel"
      :free-with-donation-label="config.bonusItemsSection.freeWithDonationLabel"
      :one-time-label="config.bonusItemsSection.oneTimeLabel"
      :monthly-label="config.bonusItemsSection.monthlyLabel"
      :yearly-label="config.bonusItemsSection.yearlyLabel"
      :add-to-unlock-single-template="config.bonusItemsSection.addToUnlockSingleTemplate"
      :add-to-unlock-pair-template="config.bonusItemsSection.addToUnlockPairTemplate"
      :add-to-unlock-list-template="config.bonusItemsSection.addToUnlockListTemplate"
      :switch-to-template="config.bonusItemsSection.switchToTemplate"
      @toggle="toggleBonusItem"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Shipping Notice -->
    <ShippingNotice
      selected-frequency="multiple"
      :products="products"
      :selected-bonus-items="selectedBonusItems"
      :multiple-cart="multipleCart"
      :donation-amounts="{ once: oneTimeTotal, monthly: monthlyTotal, yearly: yearlyTotal }"
      :message="config.shippingNotice.message"
    />

    <!-- Next Button -->
    <NextButton :disabled="!isFormValid" @click="emit('next')" />

    <!-- Product Configuration Modal -->
    <ProductOptionsModal
      ref="productOptionsModalRef"
      :currency="currency"
      :amounts-config="amountsConfig"
      @confirm="handleProductModalConfirm"
    />
  </div>
</template>
