<script setup lang="ts">
import { computed, watch } from 'vue'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import type { Product } from '~/features/donation-form/product/types'
import type { RewardsSettings } from '~/features/donation-form/rewards/types'

interface Props {
  rewards: Product[]
  selectedRewards: Set<string>
  monthlyTotal?: number
  yearlyTotal?: number
  oneTimeTotal?: number
  currency?: string
  baseCurrency?: string
  enabledFrequencies?: Array<'once' | 'monthly' | 'yearly'>
  selectedFrequency?: string
  rewardsConfig: RewardsSettings
}

interface Emits {
  (e: 'toggle', itemId: string): void
  (e: 'switchToTab', tab: 'monthly' | 'yearly'): void
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'USD',
  baseCurrency: 'GBP',
  monthlyTotal: 0,
  yearlyTotal: 0,
  oneTimeTotal: 0,
  enabledFrequencies: () => ['once', 'monthly'],
  selectedFrequency: 'once'
})

const { getCurrencySymbol } = useCurrency(props.baseCurrency)
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<Emits>()

// Filter rewards to only those with at least one enabled frequency threshold
const availableRewards = computed(() => {
  return props.rewards.filter((item) => {
    if (!item.rewardThreshold) return false
    const { once, monthly, yearly } = item.rewardThreshold

    // Include reward if it has a threshold for at least one enabled frequency
    if (once !== undefined && props.enabledFrequencies.includes('once')) return true
    if (monthly !== undefined && props.enabledFrequencies.includes('monthly')) return true
    if (yearly !== undefined && props.enabledFrequencies.includes('yearly')) return true

    return false
  })
})

const eligibleRewards = computed(() => {
  return availableRewards.value.filter((item) => {
    if (!item.rewardThreshold) return false
    const { once, monthly, yearly } = item.rewardThreshold

    // If any threshold is met, the item is eligible
    if (once !== undefined && props.oneTimeTotal >= once) return true
    if (monthly !== undefined && props.monthlyTotal >= monthly) return true
    if (yearly !== undefined && props.yearlyTotal >= yearly) return true

    return false
  })
})

const upsellRewards = computed(() => {
  return availableRewards.value.filter((item) => {
    if (!item.rewardThreshold) return false
    const { once, monthly, yearly } = item.rewardThreshold

    // Show upsell only if NO thresholds are met
    const onceMet = once !== undefined && props.oneTimeTotal >= once
    const monthlyMet = monthly !== undefined && props.monthlyTotal >= monthly
    const yearlyMet = yearly !== undefined && props.yearlyTotal >= yearly

    return !onceMet && !monthlyMet && !yearlyMet
  })
})

const isRecurringOnly = (item: Product) => {
  if (!item.rewardThreshold) return false
  const { once, monthly, yearly } = item.rewardThreshold
  const hasRecurringThreshold = monthly !== undefined || yearly !== undefined
  return hasRecurringThreshold && once === undefined
}

const getUpsellMessage = (item: Product) => {
  if (!item.rewardThreshold) return ''
  const { once, monthly, yearly } = item.rewardThreshold

  const options: string[] = []

  if (once !== undefined && props.enabledFrequencies.includes('once')) {
    const needed = Math.max(0, once - props.oneTimeTotal)
    if (needed > 0) options.push(`${currencySymbol.value}${needed} one-time`)
  }
  if (monthly !== undefined && props.enabledFrequencies.includes('monthly')) {
    const needed = Math.max(0, monthly - props.monthlyTotal)
    if (needed > 0) options.push(`${currencySymbol.value}${needed} monthly`)
  }
  if (yearly !== undefined && props.enabledFrequencies.includes('yearly')) {
    const needed = Math.max(0, yearly - props.yearlyTotal)
    if (needed > 0) options.push(`${currencySymbol.value}${needed} yearly`)
  }

  if (options.length === 0) return 'Free gift unlocked!'
  if (options.length === 1) {
    const single = options[0]!
    const parts = single.split(' ')
    const amountPart = parts[0] ?? ''
    const freqPart = parts.slice(1).join(' ')
    return `Add ${amountPart} ${freqPart} to unlock!`
  }
  if (options.length === 2) {
    const a = options[0]!
    const b = options[1]!
    return `Add ${a} or ${b} to unlock!`
  }

  const lastOption = options.pop()!
  return `Add ${options.join(', ')}, or ${lastOption} to unlock!`
}

const getFirstRecurringFrequency = (item: Product): 'monthly' | 'yearly' | null => {
  if (!item.rewardThreshold) return null
  const { monthly, yearly } = item.rewardThreshold

  // Check in order of preference: monthly, yearly
  // Only return if both enabled AND has threshold
  if (monthly !== undefined && props.enabledFrequencies.includes('monthly')) return 'monthly'
  if (yearly !== undefined && props.enabledFrequencies.includes('yearly')) return 'yearly'

  return null
}

const handleSwitchToRecurring = (item: Product) => {
  const frequency = getFirstRecurringFrequency(item)
  if (frequency) {
    emit('switchToTab', frequency)
  }
}

const getRecurringLabel = (item: Product): string => {
  const frequency = getFirstRecurringFrequency(item)
  return frequency || 'monthly'
}

const toggleReward = (itemId: string) => {
  emit('toggle', itemId)
}

const hasAnyRewards = computed(() => {
  return eligibleRewards.value.length > 0 || upsellRewards.value.length > 0
})

// Watch for changes in eligible items and auto-uncheck ineligible ones
watch(
  eligibleRewards,
  (newEligible) => {
    const eligibleIds = new Set(newEligible.map((item) => item.id))

    // Find selected items that are no longer eligible
    Array.from(props.selectedRewards).forEach((itemId) => {
      if (!eligibleIds.has(itemId)) {
        // Auto-uncheck by emitting toggle
        emit('toggle', itemId)
      }
    })
  },
  { deep: true }
)
</script>

<template>
  <div v-if="rewardsConfig.enabled && hasAnyRewards" class="space-y-4">
    <div class="border-b"></div>

    <!-- Eligible Rewards (Free Gifts) -->
    <div v-if="eligibleRewards.length > 0" class="space-y-2">
      <p class="text-sm font-medium text-muted-foreground">
        {{ rewardsConfig.ui.labels.freeGifts }}
      </p>
      <div
        v-for="item in eligibleRewards"
        :key="`reward-${item.id}`"
        class="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3"
      >
        <input
          :id="`reward-${item.id}`"
          type="checkbox"
          :checked="selectedRewards.has(item.id)"
          class="h-4 w-4 rounded border-input"
          @change="toggleReward(item.id)"
        />
        <label :for="`reward-${item.id}`" class="flex items-center gap-3 flex-1 cursor-pointer">
          <div class="text-xl">{{ item.thumbnail }}</div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm truncate">{{ item.name }}</p>
            <p class="text-xs text-success font-medium">
              {{ rewardsConfig.ui.labels.freeWithDonation }}
            </p>
          </div>
        </label>
      </div>
    </div>

    <!-- Upsell for Rewards -->
    <div v-if="upsellRewards.length > 0" class="space-y-2">
      <div
        v-for="item in upsellRewards"
        :key="`upsell-${item.id}`"
        class="rounded-lg border border-dashed bg-card p-3"
      >
        <div class="flex items-center gap-3">
          <input
            :id="`upsell-${item.id}`"
            type="checkbox"
            disabled
            class="h-4 w-4 rounded border-input opacity-50"
          />
          <label :for="`upsell-${item.id}`" class="flex items-center gap-3 flex-1">
            <div class="text-xl opacity-50">{{ item.thumbnail }}</div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-muted-foreground">{{ item.name }}</p>
              <p class="text-xs text-primary font-medium">
                {{ getUpsellMessage(item) }}
                <button
                  v-if="isRecurringOnly(item) && selectedFrequency === 'once'"
                  type="button"
                  class="underline hover:no-underline font-semibold"
                  @click="handleSwitchToRecurring(item)"
                >
                  Switch to {{ getRecurringLabel(item) }}
                </button>
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
