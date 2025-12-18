import { ref, computed } from 'vue'
import type { Product, CartItem, TributeData } from '@/lib/common/types'

export type { Product, CartItem, TributeData }

type Frequency = 'once' | 'monthly' | 'multiple'
type RecurringFrequency = 'monthly' | 'yearly'

const carts = {
  once: ref<CartItem[]>([]),
  monthly: ref<CartItem[]>([]),
  multiple: ref<CartItem[]>([])
}

export const useImpactCart = () => {
  // Shared utilities
  const getCart = (frequency: Frequency) => carts[frequency]
  const currentCart = (frequency: Frequency) => getCart(frequency).value

  const calculateTotal = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)

  const filterByFrequency = (items: CartItem[], ...frequencies: string[]) =>
    items.filter((item) => frequencies.includes(item.frequency))

  // Computed totals
  const cartTotal = (frequency: Frequency) => calculateTotal(currentCart(frequency))

  const oneTimeTotal = computed(() =>
    calculateTotal(filterByFrequency(carts.multiple.value, 'once'))
  )

  const monthlyTotal = computed(() =>
    calculateTotal(filterByFrequency(carts.multiple.value, 'monthly'))
  )

  const yearlyTotal = computed(() =>
    calculateTotal(filterByFrequency(carts.multiple.value, 'yearly'))
  )

  const recurringTotal = computed(() =>
    calculateTotal(filterByFrequency(carts.multiple.value, 'monthly', 'yearly'))
  )

  const activeRecurringFrequency = computed<RecurringFrequency | null>(() => {
    const items = carts.multiple.value
    if (items.some((item) => item.frequency === 'monthly')) return 'monthly'
    if (items.some((item) => item.frequency === 'yearly')) return 'yearly'
    return null
  })

  const canAddRecurringFrequency = (frequency: RecurringFrequency) =>
    !activeRecurringFrequency.value || activeRecurringFrequency.value === frequency

  // Cart operations
  const findItem = (frequency: Frequency, itemId: string, addedAt: number) =>
    currentCart(frequency).find((i) => i.id === itemId && i.addedAt === addedAt)

  const addToCart = (
    product: Product,
    price: number,
    frequency: Frequency = 'multiple',
    quantity?: number,
    tribute?: TributeData
  ) => {
    const cartItem: CartItem = { ...product, price, addedAt: Date.now(), quantity, tribute }
    getCart(frequency).value.push(cartItem)
    return cartItem
  }

  const removeFromCart = (itemId: string, addedAt: number, frequency: Frequency = 'multiple') => {
    const cart = getCart(frequency)
    cart.value = cart.value.filter((item) => !(item.id === itemId && item.addedAt === addedAt))
  }

  const updateCartItem = <K extends keyof CartItem>(
    frequency: Frequency,
    itemId: string,
    addedAt: number,
    key: K,
    value: CartItem[K]
  ) => {
    const item = findItem(frequency, itemId, addedAt)
    if (item) item[key] = value
  }

  const updateCartItemPrice = (
    itemId: string,
    addedAt: number,
    newPrice: number,
    frequency: Frequency = 'multiple'
  ) => updateCartItem(frequency, itemId, addedAt, 'price', newPrice)

  const updateCartItemQuantity = (
    itemId: string,
    addedAt: number,
    newQuantity: number,
    frequency: Frequency = 'multiple'
  ) => updateCartItem(frequency, itemId, addedAt, 'quantity', newQuantity)

  const updateCartItemTribute = (
    itemId: string,
    addedAt: number,
    tribute: TributeData,
    frequency: Frequency = 'multiple'
  ) => updateCartItem(frequency, itemId, addedAt, 'tribute', tribute)

  const clearCart = (frequency?: Frequency) => {
    if (frequency) {
      getCart(frequency).value = []
    } else {
      Object.values(carts).forEach((cart) => (cart.value = []))
    }
  }

  const clearRecurringItems = () => {
    carts.multiple.value = filterByFrequency(carts.multiple.value, 'once')
  }

  const restoreState = (cartItems: CartItem[]) => {
    carts.multiple.value = cartItems
  }

  return {
    // State
    onceCart: carts.once,
    monthlyCart: carts.monthly,
    multipleCart: carts.multiple,

    // Computed
    recurringTotal,
    oneTimeTotal,
    monthlyTotal,
    yearlyTotal,
    activeRecurringFrequency,

    // Methods
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
    restoreState
  }
}
