<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'

interface Props {
  needsShipping: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  back: []
  edit: []
}>()

// Get shared form config from store
const configStore = useFormConfigStore()
const formConfig = computed(() => configStore.fullConfig)

const cartStore = useImpactCartStore()
const store = useDonationFormStore()
const { getCurrencySymbol } = useCurrency()
const { labels } = useFormTypeLabels()

// Cover costs calculation (only shown from step 3 onwards AND if enabled)
const displayCoverFeesAmount = computed(() => {
  if (store.currentStep < 3 || !formConfig.value?.features.coverCosts.enabled) return 0
  return store.coverCostsAmount
})

const totalWithFees = computed(() => {
  return store.totalBeforeCoveredFees + displayCoverFeesAmount.value
})

const frequencyLabel = computed(() => {
  const noun = labels.value.frequencyLabel
  if (store.activeTab === 'once') return `one-time ${noun}`
  if (store.activeTab === 'monthly') return `monthly ${noun}`
  if (store.activeTab === 'yearly') return `yearly ${noun}`
  return `mixed ${noun}s`
})

// Item count for multiple cart
const itemCount = computed(() => {
  if (store.activeTab === 'multiple') {
    return cartStore.multipleCart.reduce((sum, item) => sum + (item.quantity || 1), 0)
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

  // Show percentage if available, otherwise indicate fixed amount
  const costsDisplay =
    store.coverCosts?.type === 'percentage'
      ? `${store.coverCosts.value}`
      : store.coverCosts?.type === 'amount'
        ? 'fixed'
        : '0'

  return {
    donation: `${symbol}${store.totalBeforeCoveredFees.toFixed(2)}`,
    costs: costsDisplay
  }
})

// Description text
const descriptionText = computed(() => {
  if (store.activeTab === 'multiple') {
    const symbol = getCurrencySymbol(store.selectedCurrency)
    const parts: string[] = []

    if (cartStore.oneTimeTotal > 0) parts.push(`${symbol}${cartStore.oneTimeTotal.toFixed(0)} once`)
    if (cartStore.monthlyTotal > 0)
      parts.push(`${symbol}${cartStore.monthlyTotal.toFixed(0)} monthly`)
    if (cartStore.yearlyTotal > 0) parts.push(`${symbol}${cartStore.yearlyTotal.toFixed(0)} yearly`)

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
      <Button
        data-preview-nav
        variant="outline"
        size="icon"
        class="h-11 w-11 shrink-0"
        @click="emit('back')"
      >
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
          <p v-if="displayCoverFeesAmount > 0" class="text-xs text-muted-foreground">
            <!-- {{ formattedBreakdown.donation }} +  -->
            <template v-if="formattedBreakdown.costs === 'fixed'">
              including {{ getCurrencySymbol(store.selectedCurrency)
              }}{{ displayCoverFeesAmount.toFixed(2) }} covered costs
            </template>
            <template v-else-if="formattedBreakdown.costs !== '0'">
              including {{ formattedBreakdown.costs }}% covered costs
            </template>
          </p>
          <p class="text-xs text-muted-foreground">{{ descriptionText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
