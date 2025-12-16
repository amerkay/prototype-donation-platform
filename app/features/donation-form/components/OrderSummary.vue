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
  back: []
  edit: []
}>()

const { multipleCart, selectedRewards, cartTotal, oneTimeTotal, monthlyTotal, yearlyTotal } =
  useImpactCart()
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
    const symbol = getCurrencySymbol(selectedCurrency.value)
    const parts: string[] = []

    if (oneTimeTotal.value > 0) parts.push(`${symbol}${oneTimeTotal.value.toFixed(0)} once`)
    if (monthlyTotal.value > 0) parts.push(`${symbol}${monthlyTotal.value.toFixed(0)} monthly`)
    if (yearlyTotal.value > 0) parts.push(`${symbol}${yearlyTotal.value.toFixed(0)} yearly`)

    const breakdown = parts.length > 1 ? parts.join(', ') : frequencyLabel.value
    return `${itemCount.value} item${itemCount.value !== 1 ? 's' : ''} • ${breakdown}`
  }
  return frequencyLabel.value
})
</script>

<template>
  <div class="rounded-lg border bg-accent/50 p-3">
    <div class="flex items-start gap-3">
      <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-top gap-3">
            <!-- Back Button -->
            <Button variant="outline" size="icon" class="h-11 w-11 shrink-0" @click="emit('back')">
              <Icon name="lucide:chevron-left" class="size-4!" />
            </Button>
            <div class="min-w-0 flex-1">
              <div class="flex gap-2">
                <p class="text-xl font-bold leading-tight">
                  {{ formattedAmount }}
                  <small v-if="itemCount > 1" class="text-muted-foreground text-xs font-normal"
                    >today</small
                  >
                </p>
              </div>
              <p class="text-xs text-muted-foreground">{{ descriptionText }}</p>
            </div>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <!-- <Badge v-if="needsShipping" variant="secondary" class="text-xs">
            <Icon name="lucide:package" class="mr-1 h-3 w-3" />
            Ship
          </Badge> -->
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-xs flex items-center"
            @click="emit('edit')"
          >
            <Icon
              name="lucide:shopping-cart"
              class="-mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
            />
            <span>Edit</span>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
