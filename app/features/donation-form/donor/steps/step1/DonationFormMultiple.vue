<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import ImpactCart from '~/features/donation-form/features/impact-cart/donor/components/ImpactCart.vue'
import NextButton from '~/features/donation-form/donor/components/NextButton.vue'
import ImpactBoostCard from '~/features/donation-form/features/impact-boost/donor/components/ImpactBoostCard.vue'
import ShippingNotice from '~/features/donation-form/features/shipping-notice/donor/components/ShippingNotice.vue'
import ProductOptionsModal from '~/features/donation-form/features/product/donor/components/ProductOptionsModal.vue'
import SharedEntryFields from '~/features/donation-form/features/entry-fields/donor/components/SharedEntryFields.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import {
  getCartItemKey,
  parseCartItemKey
} from '~/features/donation-form/features/impact-cart/donor/utils'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'

const cartStore = useImpactCartStore()
const donationStore = useDonationFormStore()
const { isFeatureSupported } = useFormTypeLabels()

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
const sharedEntryFieldsRef = ref<InstanceType<typeof SharedEntryFields> | null>(null)
const formContainerRef = ref<HTMLElement | null>(null)
const selectedProductId = ref<string | null>(null)

// Entry fields config
const entryFieldsConfig = computed(() => props.formConfig.features.entryFields)
const hasCartItems = computed(() => cartStore.multipleCart.length > 0)
const isSharedEntryMode = computed(
  () =>
    entryFieldsConfig.value?.enabled &&
    entryFieldsConfig.value.mode === 'shared' &&
    entryFieldsConfig.value.fields.length > 0
)
const showSharedEntryFields = computed(() => isSharedEntryMode.value && hasCartItems.value)

// Sync shared entry fields data to donation form store
watch(
  () => sharedEntryFieldsRef.value?.entryData,
  (data) => donationStore.updateFormSection('entryFields', data ?? {}),
  { deep: true }
)

// Clear entry fields when cart empties
watch(hasCartItems, (hasItems) => {
  if (!hasItems) donationStore.updateFormSection('entryFields', {})
})

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
const quantityRemaining = computed(
  () => props.formConfig.features.impactCart?.settings?.quantityRemaining
)

const modalMaxQuantity = computed(() => {
  if (!quantityRemaining.value || !selectedProductId.value) return undefined
  const limit = quantityRemaining.value[selectedProductId.value]
  if (limit === undefined) return undefined
  const inCart = cartStore.multipleCart
    .filter((item) => item.id === selectedProductId.value)
    .reduce((sum, item) => sum + (item.quantity ?? 1), 0)
  return Math.max(0, limit - inCart)
})
const isFormValid = computed(() => {
  const cartValid = cartStore.multipleCart.length > 0
  const sharedValid = !showSharedEntryFields.value || (sharedEntryFieldsRef.value?.isValid ?? true)
  return cartValid && sharedValid
})

// Methods
const handleSwitchToTab = (tab: 'monthly' | 'yearly', amount?: number) => {
  emit('switch-to-tab', tab, amount)
}

const handleUpdateAmount = (_amount: number) => {
  // Multiple cart doesn't support amount updates via this method
  // User must edit individual cart items
}

const handleEditCartItem = (item: CartItem, itemKey: string) => {
  selectedProductId.value = item.id
  productOptionsModalRef.value?.openForEdit(item, itemKey)
}

const handleRemoveCartItem = (itemId: string, addedAt: number) => {
  const item = cartStore.findItem('multiple', itemId, addedAt)
  if (!item) return
  const snapshot = JSON.parse(JSON.stringify(item)) as CartItem
  cartStore.removeFromCart(itemId, addedAt, 'multiple')
  toast('Removed from cart', {
    description: snapshot.name,
    action: {
      label: 'Undo',
      onClick: () => {
        const restored = cartStore.addToCart(
          snapshot,
          snapshot.price ?? 0,
          'multiple',
          snapshot.quantity,
          snapshot.tribute,
          snapshot.entryData
        )
        cartRef.value?.triggerPulse(getCartItemKey(restored.id, restored.addedAt))
      }
    }
  })
}

const handleProductSelect = (product: Product) => {
  const price = product.default ?? product.price ?? 0

  // Shared entry mode: add directly (qty=1, no modal) for one-time products
  if (isSharedEntryMode.value && product.frequency === 'once') {
    const cartItem = cartStore.addToCart(product, price, 'multiple', 1)
    const newItemKey = getCartItemKey(cartItem.id, cartItem.addedAt)
    cartRef.value?.triggerPulse(newItemKey)
    toast.success(`${product.name} added`)
    return
  }

  selectedProductId.value = product.id
  productOptionsModalRef.value?.openForAdd(product, price)
}

const handleProductModalConfirm = (
  product: Product,
  price: number,
  quantity: number,
  mode: 'add' | 'edit',
  itemKey?: string,
  tribute?: TributeData,
  entryData?: Record<string, unknown>
) => {
  if (mode === 'add') {
    const cartItem = cartStore.addToCart(product, price, 'multiple', quantity, tribute, entryData)
    const newItemKey = getCartItemKey(cartItem.id, cartItem.addedAt)
    cartRef.value?.triggerPulse(newItemKey)
    toast.success(`${product.name} added`)
  } else if (mode === 'edit' && itemKey) {
    const parsed = parseCartItemKey(itemKey)
    if (parsed) {
      cartStore.updateCartItemPrice(parsed.itemId, parsed.addedAt, price, 'multiple')
      cartStore.updateCartItemQuantity(parsed.itemId, parsed.addedAt, quantity, 'multiple')
      if (tribute) {
        cartStore.updateCartItemTribute(parsed.itemId, parsed.addedAt, tribute, 'multiple')
      }
      if (entryData) {
        cartStore.updateCartItemEntryData(parsed.itemId, parsed.addedAt, entryData, 'multiple')
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
      data-field="features.impactCart"
      :items="cartStore.multipleCart"
      :currency="currency"
      :base-currency="formConfig.donationAmounts.baseDefaultCurrency"
      :total="activeCartTotal"
      :recurring-total="cartStore.recurringTotal"
      :show-total="true"
      :products="filteredProducts"
      :initial-products-displayed="initialProductsDisplayed"
      :tribute-config="formConfig.features.tribute"
      :entry-field-definitions="entryFieldsConfig?.enabled ? entryFieldsConfig.fields : undefined"
      :quantity-remaining="quantityRemaining"
      :shared-entry-mode="isSharedEntryMode"
      @edit="handleEditCartItem"
      @remove="handleRemoveCartItem"
      @product-select="handleProductSelect"
    />

    <!-- Shared Entry Fields (below cart, shared mode) -->
    <SharedEntryFields
      v-if="showSharedEntryFields"
      ref="sharedEntryFieldsRef"
      :config="entryFieldsConfig!"
      data-field="features.entryFields"
    />

    <!-- Impact Boost (donation type only) -->
    <ImpactBoostCard
      v-if="formConfig.features.impactBoost.enabled && isFeatureSupported('impactBoost')"
      data-field="features.impactBoost"
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
      :entry-fields-config="entryFieldsConfig"
      :max-quantity="modalMaxQuantity"
      @confirm="handleProductModalConfirm"
    />
  </div>
</template>
