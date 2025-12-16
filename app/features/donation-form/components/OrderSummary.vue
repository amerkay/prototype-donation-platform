<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { Product } from '@/lib/common/types'

interface Props {
  products: Product[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
}>()

const { multipleCart, selectedRewards, cartTotal } = useImpactCart()
const { activeTab, donationAmounts, selectedProducts, selectedCurrency } = useDonationFormState('')
const { getCurrencySymbol } = useCurrency()

// Determine total amount
const totalAmount = computed(() => {
  if (activeTab.value === 'multiple') {
    return cartTotal('multiple')
  }
  return donationAmounts.value[activeTab.value as 'once' | 'monthly' | 'yearly']
})

const frequencyLabel = computed(() => {
  if (activeTab.value === 'once') return 'one-time donation'
  if (activeTab.value === 'monthly') return 'monthly donation'
  if (activeTab.value === 'yearly') return 'yearly donation'
  return 'mixed donations'
})

// Check if shipping is needed
const needsShipping = computed(() => {
  // Check single tab selections
  if (activeTab.value !== 'multiple') {
    const product = selectedProducts.value[activeTab.value as 'monthly' | 'yearly']
    if (product?.isShippingRequired) return true
  }

  // Check multiple cart
  const hasShippingItem = multipleCart.value.some((item) => item.isShippingRequired)
  if (hasShippingItem) return true

  // Check rewards
  return Array.from(selectedRewards.value).some((id) => {
    const reward = props.products.find((p) => p.id === id)
    return reward?.isShippingRequired
  })
})

// Item count for multiple cart
const itemCount = computed(() => {
  if (activeTab.value === 'multiple') {
    return multipleCart.value.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }
  return 1
})

// Format amount with currency
const formattedAmount = computed(() => {
  const symbol = getCurrencySymbol(selectedCurrency.value)
  return `${symbol}${totalAmount.value.toFixed(2)}`
})

// Description text
const descriptionText = computed(() => {
  if (activeTab.value === 'multiple') {
    return `${itemCount.value} item${itemCount.value !== 1 ? 's' : ''} • ${frequencyLabel.value}`
  }
  return frequencyLabel.value
})
</script>

<template>
  <div class="rounded-lg border bg-accent/50 p-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <Icon name="lucide:shopping-cart" class="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div class="min-w-0 flex-1">
            <p class="text-xl font-bold leading-tight">{{ formattedAmount }}</p>
            <p class="text-xs text-muted-foreground">{{ descriptionText }}</p>
          </div>
        </div>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Badge v-if="needsShipping" variant="secondary" class="text-xs">
          <Icon name="lucide:package" class="mr-1 h-3 w-3" />
          Shipping
        </Badge>
        <Button variant="ghost" size="sm" class="h-7 text-xs" @click="emit('edit')"> Edit </Button>
      </div>
    </div>
  </div>
</template>
