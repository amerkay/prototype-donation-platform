<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCart } from 'lucide-vue-next'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import { getCartItemKey } from '~/features/donation-form/features/impact-cart/donor/utils'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'
import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'
import CartProductLine from '~/features/donation-form/features/impact-cart/donor/components/ImpactCartProductLine.vue'
import ProductListContent from '~/features/donation-form/features/product/donor/components/ProductListContent.vue'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

interface Props {
  items: CartItem[]
  currency: string
  baseCurrency?: string
  total: number
  recurringTotal?: number
  showTotal?: boolean
  // Product list props
  products?: Product[]
  initialProductsDisplayed?: number
  tributeConfig: TributeSettings
  entryFieldDefinitions?: CustomFieldDefinition[]
  quantityRemaining?: Record<string, number>
  sharedEntryMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP'
})

const emit = defineEmits<{
  edit: [item: CartItem, itemKey: string]
  remove: [itemId: string, addedAt: number]
  'product-select': [product: Product]
}>()

const cartItemRefs = ref<Record<string, HTMLElement>>({})
const pulseNewItem = ref<string | null>(null)
const searchQuery = ref('')
const showAllProducts = ref(false)

const triggerPulse = (itemKey: string) => {
  pulseNewItem.value = itemKey
  setTimeout(() => {
    pulseNewItem.value = null
  }, 1000)
}

// In shared mode, exclude products already in cart (one per product)
const availableProducts = computed(() => {
  if (!props.products) return []
  if (!props.sharedEntryMode) return props.products
  const inCart = new Set(props.items.map((item) => item.id))
  return props.products.filter((p) => !inCart.has(p.id))
})

const filteredProducts = computed(() => {
  if (!searchQuery.value.trim()) return availableProducts.value
  const query = searchQuery.value.toLowerCase()
  return availableProducts.value.filter(
    (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
  )
})

// Compute cart count per product for limit checking
const cartCountByProduct = computed(() => {
  const counts: Record<string, number> = {}
  for (const item of props.items) {
    counts[item.id] = (counts[item.id] || 0) + (item.quantity ?? 1)
  }
  return counts
})

const remainingByProduct = computed(() => {
  if (!props.quantityRemaining) return undefined
  const remaining: Record<string, number> = {}
  for (const [productId, limit] of Object.entries(props.quantityRemaining)) {
    remaining[productId] = Math.max(0, limit - (cartCountByProduct.value[productId] || 0))
  }
  return remaining
})

const handleEdit = (item: CartItem) => {
  const itemKey = getCartItemKey(item.id, item.addedAt)
  emit('edit', item, itemKey)
}

const handleRemove = (item: CartItem) => {
  emit('remove', item.id, item.addedAt)
}

const handleProductSelect = (product: Product) => {
  emit('product-select', product)
}

const { getCurrencySymbol } = useCurrency(() => props.baseCurrency)
const { labels } = useFormTypeLabels()

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
  <div class="space-y-4">
    <!-- Product list: always visible when products provided -->
    <ProductListContent
      v-if="products"
      :products="filteredProducts"
      :currency="currency"
      :base-currency="baseCurrency"
      :search-query="searchQuery"
      :show-all-products="showAllProducts"
      :initial-products-displayed="initialProductsDisplayed || 3"
      :remaining-by-product="remainingByProduct"
      @update:search-query="searchQuery = $event"
      @update:show-all-products="showAllProducts = $event"
      @product-select="handleProductSelect"
    />

    <!-- Cart items (when has items) -->
    <template v-if="items.length > 0">
      <div class="flex items-center gap-2 pt-2">
        <ShoppingCart class="size-4 text-muted-foreground" />
        <h3 class="text-sm font-semibold">Your cart</h3>
      </div>
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
          :base-currency="baseCurrency"
          :tribute-config="tributeConfig"
          :entry-field-definitions="entryFieldDefinitions"
          :editable="!sharedEntryMode"
          :is-pulsing="pulseNewItem === getCartItemKey(item.id, item.addedAt)"
          @edit="handleEdit(item)"
          @remove="handleRemove(item)"
        />
      </TransitionGroup>

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
            <span class="text-sm font-medium">{{ labels.totalLabel }}</span>
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
    </template>

    <!-- Empty State when no products provided and cart empty -->
    <Empty v-else-if="!products && items.length === 0" class="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCart />
        </EmptyMedia>
        <EmptyTitle>{{ labels.emptyCartTitle }}</EmptyTitle>
      </EmptyHeader>
    </Empty>
  </div>
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
