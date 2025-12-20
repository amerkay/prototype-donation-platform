<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Ref } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'
import { useDonationFormStore } from '~/stores/donationForm'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  needsShipping: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  back: []
  edit: []
}>()

// Inject config from parent
const formConfig = inject<Ref<FormConfig>>('formConfig')
if (!formConfig) {
  throw new Error('formConfig not provided')
}

const { multipleCart, cartTotal, oneTimeTotal, monthlyTotal, yearlyTotal } = useImpactCart()
const store = useDonationFormStore()
const { getCurrencySymbol } = useCurrency()

// Determine total amount
const totalAmount = computed(() => {
  if (store.activeTab === 'multiple') {
    return cartTotal('multiple')
  }
  return store.donationAmounts[store.activeTab as 'once' | 'monthly' | 'yearly']
})

// Cover costs calculation (only shown from step 3 onwards AND if enabled)
const coverFeesPercentage = computed(() => {
  if (store.currentStep < 3) return 0
  if (!formConfig.value.features.coverCosts.enabled) return 0
  return (store.formSections.giftAid?.coverFeesPercentage as number) || 0
})

const coverFeesAmount = computed(() => {
  if (coverFeesPercentage.value === 0) return 0
  return totalAmount.value * (coverFeesPercentage.value / 100)
})

const totalWithFees = computed(() => {
  return totalAmount.value + coverFeesAmount.value
})

const frequencyLabel = computed(() => {
  if (store.activeTab === 'once') return 'one-time donation'
  if (store.activeTab === 'monthly') return 'monthly donation'
  if (store.activeTab === 'yearly') return 'yearly donation'
  return 'mixed donations'
})

// Item count for multiple cart
const itemCount = computed(() => {
  if (store.activeTab === 'multiple') {
    return multipleCart.value.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }
  return 1
})

// Format amount with currency
const formattedAmount = computed(() => {
  const symbol = getCurrencySymbol(store.selectedCurrency)
  return `${symbol}${totalWithFees.value.toFixed(2)}`
})

const formattedBreakdown = computed(() => {
  const symbol = getCurrencySymbol(store.selectedCurrency)
  return {
    donation: `${symbol}${totalAmount.value.toFixed(2)}`,
    costs: `${coverFeesPercentage.value}`
  }
})

// Description text
const descriptionText = computed(() => {
  if (store.activeTab === 'multiple') {
    const symbol = getCurrencySymbol(store.selectedCurrency)
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
      <!-- Back Button -->
      <Button variant="outline" size="icon" class="h-11 w-11 shrink-0" @click="emit('back')">
        <Icon name="lucide:chevron-left" class="size-4!" />
      </Button>

      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <!-- First Row: Total, Ship Badge, Edit Button -->
        <div class="flex items-center justify-between gap-3 -mt-1">
          <p class="text-lg font-bold leading-tight">
            {{ formattedAmount }}
            <!-- <small v-if="itemCount > 1" class="text-muted-foreground text-xs font-normal"
              >today</small
            > -->
          </p>
          <div class="flex shrink-0 items-center gap-1">
            <Badge v-if="needsShipping" variant="secondary" class="text-xs">
              <Icon name="lucide:package" class="mr-1 h-3 w-3" />
              Ship
            </Badge>
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

        <!-- Second Row: Breakdown and Description -->
        <div class="flex flex-col">
          <p v-if="coverFeesAmount > 0" class="text-xs text-muted-foreground">
            <!-- {{ formattedBreakdown.donation }} +  -->
            including {{ formattedBreakdown.costs }}% covered costs
          </p>
          <p class="text-xs text-muted-foreground">{{ descriptionText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
