import { ref, computed } from 'vue'
import type { Product, CartItem, TributeData } from '@/lib/common/types'

// Re-export types for backward compatibility
export type { Product, CartItem, TributeData }

const onceCart = ref<CartItem[]>([])
const monthlyCart = ref<CartItem[]>([])
const multipleCart = ref<CartItem[]>([])
const selectedRewards = ref<Set<string>>(new Set())

export const useImpactCart = () => {
  const getCartByFrequency = (frequency: 'once' | 'monthly' | 'multiple') => {
    if (frequency === 'once') return onceCart
    if (frequency === 'monthly') return monthlyCart
    return multipleCart
  }

  const currentCart = (frequency: 'once' | 'monthly' | 'multiple') => {
    return getCartByFrequency(frequency).value
  }

  const cartTotal = (frequency: 'once' | 'monthly' | 'multiple') => {
    return currentCart(frequency).reduce((sum, item) => {
      const price = item.price || 0
      const quantity = item.quantity || 1
      return sum + price * quantity
    }, 0)
  }

  const recurringTotal = computed(() => {
    return multipleCart.value
      .filter((item) => ['monthly', 'yearly'].includes(item.frequency))
      .reduce((sum, item) => {
        const price = item.price || 0
        const quantity = item.quantity || 1
        return sum + price * quantity
      }, 0)
  })

  const oneTimeTotal = computed(() => {
    return multipleCart.value
      .filter((item) => item.frequency === 'once')
      .reduce((sum, item) => {
        const price = item.price || 0
        const quantity = item.quantity || 1
        return sum + price * quantity
      }, 0)
  })

  const monthlyTotal = computed(() => {
    return multipleCart.value
      .filter((item) => item.frequency === 'monthly')
      .reduce((sum, item) => {
        const price = item.price || 0
        const quantity = item.quantity || 1
        return sum + price * quantity
      }, 0)
  })

  const yearlyTotal = computed(() => {
    return multipleCart.value
      .filter((item) => item.frequency === 'yearly')
      .reduce((sum, item) => {
        const price = item.price || 0
        const quantity = item.quantity || 1
        return sum + price * quantity
      }, 0)
  })

  const activeRecurringFrequency = computed<'monthly' | 'yearly' | null>(() => {
    const items = multipleCart.value
    if (items.some((item) => item.frequency === 'monthly')) return 'monthly'
    if (items.some((item) => item.frequency === 'yearly')) return 'yearly'
    return null
  })

  const canAddRecurringFrequency = (frequency: 'monthly' | 'yearly') => {
    const active = activeRecurringFrequency.value
    return !active || active === frequency
  }

  const addToCart = (
    product: Product,
    price: number,
    frequency: 'once' | 'monthly' | 'multiple' = 'multiple',
    quantity?: number,
    tribute?: TributeData
  ) => {
    const cartItem: CartItem = { ...product, price, addedAt: Date.now(), quantity, tribute }
    const cart = getCartByFrequency(frequency)
    cart.value.push(cartItem)
    return cartItem
  }

  const removeFromCart = (
    itemId: string,
    addedAt: number,
    frequency: 'once' | 'monthly' | 'multiple' = 'multiple'
  ) => {
    const cart = getCartByFrequency(frequency)
    cart.value = cart.value.filter((item) => !(item.id === itemId && item.addedAt === addedAt))
  }

  const updateCartItemPrice = (
    itemId: string,
    addedAt: number,
    newPrice: number,
    frequency: 'once' | 'monthly' | 'multiple' = 'multiple'
  ) => {
    const item = currentCart(frequency).find((i) => i.id === itemId && i.addedAt === addedAt)
    if (item) {
      item.price = newPrice
    }
  }

  const updateCartItemQuantity = (
    itemId: string,
    addedAt: number,
    newQuantity: number,
    frequency: 'once' | 'monthly' | 'multiple' = 'multiple'
  ) => {
    const item = currentCart(frequency).find((i) => i.id === itemId && i.addedAt === addedAt)
    if (item) {
      item.quantity = newQuantity
    }
  }

  const updateCartItemTribute = (
    itemId: string,
    addedAt: number,
    tribute: TributeData,
    frequency: 'once' | 'monthly' | 'multiple' = 'multiple'
  ) => {
    const item = currentCart(frequency).find((i) => i.id === itemId && i.addedAt === addedAt)
    if (item) {
      item.tribute = tribute
    }
  }

  const toggleReward = (itemId: string) => {
    if (selectedRewards.value.has(itemId)) {
      selectedRewards.value.delete(itemId)
    } else {
      selectedRewards.value.add(itemId)
    }
  }

  const clearCart = (frequency?: 'once' | 'monthly' | 'multiple') => {
    if (frequency) {
      getCartByFrequency(frequency).value = []
    } else {
      onceCart.value = []
      monthlyCart.value = []
      multipleCart.value = []
    }
  }

  const clearRecurringItems = () => {
    multipleCart.value = multipleCart.value.filter((item) => item.frequency === 'once')
  }

  return {
    // State
    onceCart,
    monthlyCart,
    multipleCart,
    selectedRewards,

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
    toggleReward,
    clearCart,
    clearRecurringItems,
    canAddRecurringFrequency
  }
}
