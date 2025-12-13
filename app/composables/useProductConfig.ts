import { ref, type Ref } from 'vue'
import type { Product, CartItem } from '@/lib/common/types'
import { getCartItemKey, parseCartItemKey } from '@/lib/common/cart-utils'
import type Cart from '@/components/donation-form/cart/Cart.vue'

export const useProductConfig = () => {
  const drawerOpen = ref(false)
  const drawerProduct = ref<Product | null>(null)
  const drawerMode = ref<'add' | 'edit'>('add')
  const drawerInitialPrice = ref(0)
  const editingItemKey = ref<string | null>(null)

  const openDrawerForAdd = (product: Product, initialPrice: number) => {
    drawerProduct.value = product
    drawerMode.value = 'add'
    drawerInitialPrice.value = initialPrice
    editingItemKey.value = null
    drawerOpen.value = true
  }

  const openDrawerForEdit = (item: CartItem, itemKey: string) => {
    drawerProduct.value = item
    drawerMode.value = 'edit'
    drawerInitialPrice.value = item.price
    editingItemKey.value = itemKey
    drawerOpen.value = true
  }

  const handleDrawerConfirm = (
    price: number,
    onAdd: (product: Product, price: number) => CartItem,
    onEdit: (itemId: string, addedAt: number, price: number) => void,
    cartRef?: Ref<InstanceType<typeof Cart> | null>
  ) => {
    if (!drawerProduct.value) return

    if (drawerMode.value === 'add') {
      const cartItem = onAdd(drawerProduct.value, price)
      const itemKey = getCartItemKey(cartItem.id, cartItem.addedAt)

      // Pulse animation and scroll handled by Cart component
      if (cartRef?.value) {
        cartRef.value.pulseNewItem = itemKey
        setTimeout(() => {
          if (cartRef?.value) {
            cartRef.value.pulseNewItem = null
          }
        }, 2000)

        // Scroll to the specific new item after animation completes
        setTimeout(() => {
          if (cartRef?.value) {
            const itemElement = cartRef.value.cartItemRefs[itemKey]
            if (itemElement) {
              const elementPosition = itemElement.getBoundingClientRect().top + window.scrollY
              const offsetPosition = elementPosition - 50
              window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
            }
          }
        }, 350)
      }
    } else if (drawerMode.value === 'edit' && editingItemKey.value) {
      const parsed = parseCartItemKey(editingItemKey.value)
      if (parsed) {
        const { itemId, addedAt } = parsed
        onEdit(itemId, addedAt, price)
      }
    }
  }

  const closeDrawer = () => {
    drawerOpen.value = false
  }

  return {
    // State
    drawerOpen,
    drawerProduct,
    drawerMode,
    drawerInitialPrice,
    editingItemKey,

    // Methods
    getCartItemKey,
    openDrawerForAdd,
    openDrawerForEdit,
    handleDrawerConfirm,
    closeDrawer
  }
}
