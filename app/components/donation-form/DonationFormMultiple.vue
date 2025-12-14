<script setup lang="ts">
import { ref, computed } from 'vue'
import Cart from '@/components/donation-form/cart/Cart.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import BonusItemsSection from '~/components/donation-form/common/BonusItemsSection.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import type { Product, CartItem } from '@/lib/common/types'

const {
  multipleCart,
  selectedBonusItems,
  cartTotal,
  recurringTotal,
  oneTimeTotal,
  monthlyTotal,
  yearlyTotal,
  activeRecurringFrequency,
  toggleBonusItem
} = useCart()

interface Props {
  currency: string
  bonusItems: Product[]
  products: Product[]
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  initialProductsDisplayed: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'edit-cart-item': [item: CartItem, itemKey: string]
  'remove-cart-item': [itemId: string, addedAt: number]
  'product-select': [product: Product]
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly']
}>()

const cartRef = ref<InstanceType<typeof Cart> | null>(null)

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
      @edit="(item, itemKey) => emit('edit-cart-item', item, itemKey)"
      @remove="(itemId, addedAt) => emit('remove-cart-item', itemId, addedAt)"
      @product-select="(product) => emit('product-select', product)"
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
  </div>
</template>
