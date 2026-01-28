<script setup lang="ts">
import { ref, computed } from 'vue'
import ImpactCart from '~/features/donation-form/features/impact-cart/donor/components/ImpactCart.vue'
import NextButton from '~/features/donation-form/donor/components/NextButton.vue'
import ImpactBoostCard from '~/features/donation-form/features/impact-boost/donor/components/ImpactBoostCard.vue'
import ShippingNotice from '~/features/donation-form/features/shipping-notice/donor/components/ShippingNotice.vue'
import ProductOptionsModal from '~/features/donation-form/features/product/donor/components/ProductOptionsModal.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import {
  getCartItemKey,
  parseCartItemKey
} from '~/features/donation-form/features/impact-cart/donor/utils'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'

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
  'switch-to-tab': [tab: 'monthly' | 'yearly', amount?: number]
}>()

const cartRef = ref<InstanceType<typeof ImpactCart> | null>(null)
const productOptionsModalRef = ref<InstanceType<typeof ProductOptionsModal> | null>(null)
const formContainerRef = ref<HTMLElement | null>(null)

// Computed
const filteredProducts = computed(() => {
  let products = props.products
  const locked = cartStore.activeRecurringFrequency
  if (locked) {
    products = products.filter((p) => p.frequency === 'once' || p.frequency === locked)
  }
  return products
})

const activeCartTotal = computed(() => cartStore.cartTotal('multiple'))
const isFormValid = computed(() => cartStore.multipleCart.length > 0)

// Methods
const handleSwitchToTab = (tab: 'monthly' | 'yearly', amount?: number) => {
  emit('switch-to-tab', tab, amount)
}

const handleUpdateAmount = (_amount: number) => {
  // Multiple cart doesn't support amount updates via this method
  // User must edit individual cart items
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
      :base-currency="formConfig.donationAmounts.baseDefaultCurrency"
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

    <!-- Impact Boost -->
    <ImpactBoostCard
      v-if="formConfig.features.impactBoost.enabled"
      frequency="multiple"
      :donation-amount="cartStore.recurringTotal"
      :currency="currency"
      :base-currency="formConfig.donationAmounts.baseDefaultCurrency"
      :config="formConfig.features.impactBoost"
      :donation-amounts-config="formConfig.donationAmounts"
      :enabled-frequencies="enabledFrequencies"
      @switch-to-tab="handleSwitchToTab"
      @update-amount="handleUpdateAmount"
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
      :base-currency="formConfig.donationAmounts.baseDefaultCurrency"
      :donation-amounts-config="formConfig.donationAmounts.frequencies"
      :tribute-config="formConfig.features.tribute"
      @confirm="handleProductModalConfirm"
    />
  </div>
</template>
