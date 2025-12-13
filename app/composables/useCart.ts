import { ref, computed } from 'vue'
import type { Product, CartItem, CartFrequencyType } from '@/lib/common/types'

// Re-export types for backward compatibility
export type { Product, CartItem }

const onceCart = ref<CartItem[]>([])
const monthlyCart = ref<CartItem[]>([])
const multipleCart = ref<CartItem[]>([])
const selectedBonusItems = ref<Set<string>>(new Set())

export const useCart = () => {
    const getCartByFrequency = (frequency: 'once' | 'monthly' | 'multiple') => {
        if (frequency === 'once') return onceCart
        if (frequency === 'monthly') return monthlyCart
        return multipleCart
    }

    const currentCart = (frequency: 'once' | 'monthly' | 'multiple') => {
        return getCartByFrequency(frequency).value
    }

    const cartTotal = (frequency: 'once' | 'monthly' | 'multiple') => {
        return currentCart(frequency).reduce((sum, item) => sum + (item.price || 0), 0)
    }

    const recurringTotal = computed(() => {
        return multipleCart.value
            .filter(item => ['weekly', 'monthly', 'quarterly', 'yearly'].includes(item.frequency))
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const oneTimeTotal = computed(() => {
        return multipleCart.value
            .filter(item => item.frequency === 'once')
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const weeklyTotal = computed(() => {
        return multipleCart.value
            .filter(item => item.frequency === 'weekly')
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const monthlyTotal = computed(() => {
        return multipleCart.value
            .filter(item => item.frequency === 'monthly')
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const quarterlyTotal = computed(() => {
        return multipleCart.value
            .filter(item => item.frequency === 'quarterly')
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const yearlyTotal = computed(() => {
        return multipleCart.value
            .filter(item => item.frequency === 'yearly')
            .reduce((sum, item) => sum + (item.price || 0), 0)
    })

    const addToCart = (product: Product, price: number, frequency: 'once' | 'monthly' | 'multiple' = 'multiple') => {
        const cartItem: CartItem = { ...product, price, addedAt: Date.now() }
        const cart = getCartByFrequency(frequency)
        cart.value.push(cartItem)
        return cartItem
    }

    const removeFromCart = (itemId: string, addedAt: number, frequency: 'once' | 'monthly' | 'multiple' = 'multiple') => {
        const cart = getCartByFrequency(frequency)
        cart.value = cart.value.filter(item => !(item.id === itemId && item.addedAt === addedAt))
    }

    const updateCartItemPrice = (itemId: string, addedAt: number, newPrice: number, frequency: 'once' | 'monthly' | 'multiple' = 'multiple') => {
        const item = currentCart(frequency).find(i => i.id === itemId && i.addedAt === addedAt)
        if (item) {
            item.price = newPrice
        }
    }

    const toggleBonusItem = (itemId: string) => {
        if (selectedBonusItems.value.has(itemId)) {
            selectedBonusItems.value.delete(itemId)
        } else {
            selectedBonusItems.value.add(itemId)
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

    return {
        // State
        onceCart,
        monthlyCart,
        multipleCart,
        selectedBonusItems,

        // Computed
        recurringTotal,
        oneTimeTotal,
        weeklyTotal,
        monthlyTotal,
        quarterlyTotal,
        yearlyTotal,

        // Methods
        currentCart,
        cartTotal,
        addToCart,
        removeFromCart,
        updateCartItemPrice,
        toggleBonusItem,
        clearCart,
    }
}
