<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCart } from 'lucide-vue-next'
import { getCartItemKey } from '@/lib/common/cart-utils'
import type { CartItem, Product } from '@/lib/common/types'
import CartProductLine from '@/components/donation-form/cart/CartProductLine.vue'
import ProductListContent from '~/components/donation-form/product/ProductListContent.vue'
import BaseDialogOrDrawer from '@/components/donation-form/common/BaseDialogOrDrawer.vue'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyContent } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'

interface Props {
  items: CartItem[]
  currency: string
  total: number
  recurringTotal?: number
  showTotal?: boolean
  // Product list props
  products?: Product[]
  initialProductsDisplayed?: number
  productListConfig?: {
    title: string
    searchPlaceholder: string
    showMoreButton: string
    emptyStateMessage: string
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [item: CartItem, itemKey: string]
  remove: [itemId: string, addedAt: number]
  'product-select': [product: Product]
}>()

const cartItemRefs = ref<Record<string, HTMLElement>>({})
const pulseNewItem = ref<string | null>(null)
const productListOpen = ref(false)
const searchQuery = ref('')
const showAllProducts = ref(false)

const triggerPulse = (itemKey: string) => {
  pulseNewItem.value = itemKey
  setTimeout(() => {
    pulseNewItem.value = null
  }, 1000)
}

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim() || !props.products) return props.products || []
  const query = searchQuery.value.toLowerCase()
  return props.products.filter(
    (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
  )
})

const handleEdit = (item: CartItem) => {
  const itemKey = getCartItemKey(item.id, item.addedAt)
  emit('edit', item, itemKey)
}

const handleRemove = (item: CartItem) => {
  emit('remove', item.id, item.addedAt)
}

const handleProductSelect = (product: Product) => {
  productListOpen.value = false
  emit('product-select', product)
}

const { getCurrencySymbol } = useCurrency()

const totalLabel = computed(() => {
  if (props.items.length === 0) return 'Total'

  const frequencies = new Set(props.items.map((item) => item.frequency))

  // All items have the same frequency
  if (frequencies.size === 1) {
    const frequency = Array.from(frequencies)[0]
    if (frequency === 'once') return 'Total (one-time)'
    if (frequency === 'monthly') return 'Total (monthly)'
    if (frequency === 'yearly') return 'Total (yearly)'
  }

  return 'Total'
})

defineExpose({
  cartItemRefs,
  pulseNewItem,
  getCartItemKey,
  triggerPulse
})
</script>

<template>
  <div v-if="items.length > 0" class="space-y-4">
    <TransitionGroup name="list" tag="div" class="space-y-2 scroll-mt-6">
      <CartProductLine
        v-for="item in items"
        :key="getCartItemKey(item.id, item.addedAt)"
        :ref="
          (el) => {
            if (el) cartItemRefs[getCartItemKey(item.id, item.addedAt)] = el as any
          }
        "
        :item="item"
        :currency="currency"
        :is-pulsing="pulseNewItem === getCartItemKey(item.id, item.addedAt)"
        @edit="handleEdit(item)"
        @remove="handleRemove(item)"
      />
    </TransitionGroup>

    <!-- Add Items Button -->
    <Button class="w-full" @click="productListOpen = true"> Add more to cart </Button>

    <div v-if="showTotal" class="rounded-lg bg-muted p-3 space-y-2">
      <!-- Show breakdown when both one-time and recurring exist -->
      <template
        v-if="recurringTotal !== undefined && recurringTotal > 0 && total - recurringTotal > 0"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">One-time</span>
          <span class="text-base font-semibold"
            >{{ getCurrencySymbol(currency) }}{{ total - recurringTotal }}</span
          >
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">Monthly Recurring</span>
          <span class="text-base font-semibold"
            >{{ getCurrencySymbol(currency) }}{{ recurringTotal }}</span
          >
        </div>
        <div class="flex items-center justify-between pt-2 border-t">
          <span class="text-sm font-medium">Today's Total</span>
          <span class="text-lg font-bold">{{ getCurrencySymbol(currency) }}{{ total }}</span>
        </div>
      </template>
      <!-- Show single line when only one type exists -->
      <template v-else>
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium">{{ totalLabel }}</span>
          <span class="text-lg font-bold">{{ getCurrencySymbol(currency) }}{{ total }}</span>
        </div>
      </template>
    </div>
  </div>

  <!-- Empty State: Show inline ProductListContent or Empty Cart -->
  <div v-else>
    <!-- Inline ProductListContent (shown when cart is empty) -->
    <ProductListContent
      v-if="products && productListConfig"
      :products="filteredProducts"
      :currency="currency"
      :search-query="searchQuery"
      :show-all-products="showAllProducts"
      :initial-products-displayed="initialProductsDisplayed || 3"
      :config="productListConfig"
      @update:search-query="searchQuery = $event"
      @update:show-all-products="showAllProducts = $event"
      @product-select="handleProductSelect"
    />

    <!-- Empty State when no products provided -->
    <Empty v-else class="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCart />
        </EmptyMedia>
        <EmptyTitle>Your cart is empty</EmptyTitle>
      </EmptyHeader>
      <EmptyContent>
        <Button class="w-full" @click="productListOpen = true"> Add items to cart </Button>
      </EmptyContent>
    </Empty>
  </div>

  <!-- Modal with ProductListContent (when Add Items is clicked from button) -->
  <BaseDialogOrDrawer v-if="productListOpen" v-model:open="productListOpen" :dismissible="true">
    <template #header>
      <h2 class="text-2xl font-semibold">{{ productListConfig?.title }}</h2>
    </template>
    <template #content>
      <ProductListContent
        v-if="products && productListConfig"
        :products="filteredProducts"
        :currency="currency"
        :search-query="searchQuery"
        :show-all-products="showAllProducts"
        :initial-products-displayed="initialProductsDisplayed || 3"
        :config="productListConfig"
        @update:search-query="searchQuery = $event"
        @update:show-all-products="showAllProducts = $event"
        @product-select="handleProductSelect"
      />
    </template>
  </BaseDialogOrDrawer>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
