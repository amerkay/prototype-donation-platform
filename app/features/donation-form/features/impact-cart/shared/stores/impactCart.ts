import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/shared/types'
import type { TributeData } from '~/features/donation-form/features/tribute/shared/types'

// Type definitions
type Frequency = 'once' | 'monthly' | 'multiple'
type RecurringFrequency = 'monthly' | 'yearly'

export const useImpactCartStore = defineStore(
  'impactCart',
  () => {
    // ==================== STATE ====================
    const onceCart = ref<CartItem[]>([])
    const monthlyCart = ref<CartItem[]>([])
    const multipleCart = ref<CartItem[]>([])

    // ==================== GETTERS ====================
    const calculateTotal = (items: CartItem[]) =>
      items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)

    const filterByFrequency = (items: CartItem[], ...frequencies: string[]) =>
      items.filter((item) => frequencies.includes(item.frequency))

    // Cart totals
    const onceCartTotal = computed(() => calculateTotal(onceCart.value))
    const monthlyCartTotal = computed(() => calculateTotal(monthlyCart.value))
    const multipleCartTotal = computed(() => calculateTotal(multipleCart.value))

    // Multiple cart breakdowns
    const oneTimeTotal = computed(() =>
      calculateTotal(filterByFrequency(multipleCart.value, 'once'))
    )

    const monthlyTotal = computed(() =>
      calculateTotal(filterByFrequency(multipleCart.value, 'monthly'))
    )

    const yearlyTotal = computed(() =>
      calculateTotal(filterByFrequency(multipleCart.value, 'yearly'))
    )

    const recurringTotal = computed(() =>
      calculateTotal(filterByFrequency(multipleCart.value, 'monthly', 'yearly'))
    )

    const activeRecurringFrequency = computed<RecurringFrequency | null>(() => {
      const items = multipleCart.value
      if (items.some((item) => item.frequency === 'monthly')) return 'monthly'
      if (items.some((item) => item.frequency === 'yearly')) return 'yearly'
      return null
    })

    // ==================== ACTIONS ====================
    function getCart(frequency: Frequency) {
      switch (frequency) {
        case 'once':
          return onceCart
        case 'monthly':
          return monthlyCart
        case 'multiple':
          return multipleCart
      }
    }

    function currentCart(frequency: Frequency) {
      return getCart(frequency).value
    }

    function cartTotal(frequency: Frequency) {
      return calculateTotal(currentCart(frequency))
    }

    function canAddRecurringFrequency(frequency: RecurringFrequency) {
      return !activeRecurringFrequency.value || activeRecurringFrequency.value === frequency
    }

    function findItem(frequency: Frequency, itemId: string, addedAt: number) {
      return currentCart(frequency).find((i) => i.id === itemId && i.addedAt === addedAt)
    }

    function addToCart(
      product: Product,
      price: number,
      frequency: Frequency = 'multiple',
      quantity?: number,
      tribute?: TributeData
    ) {
      const cartItem: CartItem = { ...product, price, addedAt: Date.now(), quantity, tribute }
      getCart(frequency).value.push(cartItem)
      return cartItem
    }

    function removeFromCart(itemId: string, addedAt: number, frequency: Frequency = 'multiple') {
      const cart = getCart(frequency)
      cart.value = cart.value.filter((item) => !(item.id === itemId && item.addedAt === addedAt))
    }

    function updateCartItem<K extends keyof CartItem>(
      frequency: Frequency,
      itemId: string,
      addedAt: number,
      key: K,
      value: CartItem[K]
    ) {
      const item = findItem(frequency, itemId, addedAt)
      if (item) item[key] = value
    }

    function updateCartItemPrice(
      itemId: string,
      addedAt: number,
      newPrice: number,
      frequency: Frequency = 'multiple'
    ) {
      updateCartItem(frequency, itemId, addedAt, 'price', newPrice)
    }

    function updateCartItemQuantity(
      itemId: string,
      addedAt: number,
      newQuantity: number,
      frequency: Frequency = 'multiple'
    ) {
      updateCartItem(frequency, itemId, addedAt, 'quantity', newQuantity)
    }

    function updateCartItemTribute(
      itemId: string,
      addedAt: number,
      tribute: TributeData,
      frequency: Frequency = 'multiple'
    ) {
      updateCartItem(frequency, itemId, addedAt, 'tribute', tribute)
    }

    function clearCart(frequency?: Frequency) {
      if (frequency) {
        getCart(frequency).value = []
      } else {
        onceCart.value = []
        monthlyCart.value = []
        multipleCart.value = []
      }
    }

    function clearRecurringItems() {
      multipleCart.value = filterByFrequency(multipleCart.value, 'once')
    }

    function reset() {
      clearCart()
    }

    function restoreState(cartItems: CartItem[]) {
      multipleCart.value = cartItems
    }

    // Persistence methods (called by plugin after hydration)
    function $persist() {
      if (import.meta.server) return
      try {
        sessionStorage.setItem(
          'impact-cart',
          JSON.stringify({
            onceCart: onceCart.value,
            monthlyCart: monthlyCart.value,
            multipleCart: multipleCart.value
          })
        )
      } catch (error) {
        console.warn('Failed to persist impact cart:', error)
      }
    }

    function $hydrate() {
      if (import.meta.server) return
      try {
        const saved = sessionStorage.getItem('impact-cart')
        if (!saved) return

        const data = JSON.parse(saved)
        if (data.onceCart !== undefined) onceCart.value = data.onceCart
        if (data.monthlyCart !== undefined) monthlyCart.value = data.monthlyCart
        if (data.multipleCart !== undefined) multipleCart.value = data.multipleCart
      } catch (error) {
        console.warn('Failed to hydrate impact cart:', error)
      }
    }

    return {
      // State
      onceCart,
      monthlyCart,
      multipleCart,

      // Getters
      onceCartTotal,
      monthlyCartTotal,
      multipleCartTotal,
      recurringTotal,
      oneTimeTotal,
      monthlyTotal,
      yearlyTotal,
      activeRecurringFrequency,

      // Actions
      currentCart,
      cartTotal,
      addToCart,
      removeFromCart,
      updateCartItemPrice,
      updateCartItemQuantity,
      updateCartItemTribute,
      clearCart,
      clearRecurringItems,
      canAddRecurringFrequency,
      restoreState,
      reset,
      $persist,
      $hydrate
    }
  }
  // No persist config - manual handling in plugin to avoid SSR hydration issues
)
