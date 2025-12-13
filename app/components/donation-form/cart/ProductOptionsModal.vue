<script setup lang="ts">
import { ref, computed, type Ref } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import AmountSelector from '~/components/donation-form/common/AmountSelector.vue'
import type { Product, CartItem } from '@/lib/common/types'
import { getCartItemKey, parseCartItemKey } from '@/lib/common/cart-utils'
import type Cart from '@/components/donation-form/cart/Cart.vue'

interface Props {
  currency: string
  baseCurrency?: string
  amountsConfig?: {
    once: { amounts: readonly number[]; minPrice: number; maxPrice: number }
    monthly: { amounts: readonly number[]; minPrice: number; maxPrice: number }
    yearly: { amounts: readonly number[]; minPrice: number; maxPrice: number }
  }
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  amountsConfig: () => ({
    once: { amounts: [10, 25, 50, 100, 250, 500], minPrice: 5, maxPrice: 1000 },
    monthly: { amounts: [5, 10, 25, 50, 75, 100], minPrice: 3, maxPrice: 500 },
    yearly: { amounts: [50, 100, 250, 500, 1000], minPrice: 25, maxPrice: 2000 }
  })
})

const emit = defineEmits<{
  confirm: [product: Product, price: number, mode: 'add' | 'edit', itemKey?: string]
}>()

const { getCurrencySymbol, convertPrice } = useCurrency()

// Internal state
const open = ref(false)
const product = ref<Product | null>(null)
const mode = ref<'add' | 'edit'>('add')
const localPrice = ref(0)
const editingItemKey = ref<string | null>(null)

// Computed
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const isRecurring = computed(
  () => product.value?.frequency === 'monthly' || product.value?.frequency === 'yearly'
)

const frequencyLabel = computed(() => {
  if (!product.value) return 'donation'
  if (product.value.frequency === 'monthly') return 'monthly donation'
  if (product.value.frequency === 'yearly') return 'yearly donation'
  return 'one-time donation'
})

const amounts = computed(() => {
  if (!product.value || !isRecurring.value) return []
  const freq = product.value.frequency as keyof typeof props.amountsConfig
  const config = props.amountsConfig[freq]
  if (!config) return []
  return config.amounts.map((amount) => convertPrice(amount, props.currency))
})

const maxPrice = computed(() => {
  if (!product.value) return 1000
  const freq = product.value.frequency as keyof typeof props.amountsConfig
  const config = props.amountsConfig[freq]
  return convertPrice(config?.maxPrice ?? 1000, props.currency)
})

const hasPresetAmounts = computed(() => isRecurring.value && amounts.value.length > 0)

// Methods
const openForAdd = (prod: Product, initialPrice: number) => {
  product.value = prod
  mode.value = 'add'
  localPrice.value = initialPrice
  editingItemKey.value = null
  open.value = true
}

const openForEdit = (item: CartItem, itemKey: string) => {
  product.value = item
  mode.value = 'edit'
  localPrice.value = item.price ?? 0
  editingItemKey.value = itemKey
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const handleConfirm = () => {
  if (!product.value) return

  emit('confirm', product.value, localPrice.value, mode.value, editingItemKey.value || undefined)
  open.value = false
}

// Expose methods for parent component
defineExpose({
  openForAdd,
  openForEdit
})
</script>

<template>
  <BaseDialogOrDrawer :open="open" @update:open="open = $event">
    <template #header>
      <div class="flex items-center gap-3 mb-2">
        <div class="text-4xl">{{ product?.thumbnail }}</div>
        <div class="flex-1 min-w-0 text-left">
          <h2 class="text-lg font-semibold">{{ product?.name }}</h2>
          <p class="text-sm text-muted-foreground">
            {{ product?.description }}
          </p>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-4">
        <!-- One-time fixed price display -->
        <div v-if="!isRecurring" class="rounded-lg bg-muted p-4 text-center">
          <p class="text-sm text-muted-foreground">One-time donation</p>
          <p class="text-3xl font-bold">{{ currencySymbol }}{{ product?.price }}</p>
        </div>

        <!-- Recurring with or without preset amounts -->
        <AmountSelector
          v-else-if="isRecurring"
          v-model="localPrice"
          :amounts="amounts"
          :currency="currency"
          :min-price="product?.minPrice ?? 0"
          :max-price="maxPrice"
          :frequency-label="frequencyLabel"
          :frequency="product?.frequency ?? 'once'"
        />
      </div>
    </template>

    <template #footer>
      <Button class="flex-1 md:flex-1 h-12" @click="handleConfirm">
        {{ mode === 'edit' ? 'Update' : 'Add to Cart' }}
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleClose"> Cancel </Button>
    </template>
  </BaseDialogOrDrawer>
</template>
