<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Product } from '@/lib/common/types'

interface Props {
    bonusItems: Product[]
    selectedBonusItems: Set<string>
    weeklyTotal?: number
    monthlyTotal?: number
    quarterlyTotal?: number
    yearlyTotal?: number
    oneTimeTotal?: number
    currency?: string
    enabledFrequencies?: Array<'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>
}

interface Emits {
    (e: 'toggle', itemId: string): void
    (e: 'switchToTab', tab: 'weekly' | 'monthly' | 'quarterly' | 'yearly'): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    weeklyTotal: 0,
    monthlyTotal: 0,
    quarterlyTotal: 0,
    yearlyTotal: 0,
    oneTimeTotal: 0,
    enabledFrequencies: () => ['once', 'monthly']
})

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<Emits>()

const eligibleBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        const { once, weekly, monthly, quarterly, yearly } = item.bonusThreshold

        // If any threshold is met, the item is eligible
        if (once !== undefined && props.oneTimeTotal >= once) return true
        if (weekly !== undefined && props.weeklyTotal >= weekly) return true
        if (monthly !== undefined && props.monthlyTotal >= monthly) return true
        if (quarterly !== undefined && props.quarterlyTotal >= quarterly) return true
        if (yearly !== undefined && props.yearlyTotal >= yearly) return true

        return false
    })
})

const upsellBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        const { once, weekly, monthly, quarterly, yearly } = item.bonusThreshold

        // Show upsell only if NO thresholds are met
        const onceMet = once !== undefined && props.oneTimeTotal >= once
        const weeklyMet = weekly !== undefined && props.weeklyTotal >= weekly
        const monthlyMet = monthly !== undefined && props.monthlyTotal >= monthly
        const quarterlyMet = quarterly !== undefined && props.quarterlyTotal >= quarterly
        const yearlyMet = yearly !== undefined && props.yearlyTotal >= yearly

        return !onceMet && !weeklyMet && !monthlyMet && !quarterlyMet && !yearlyMet
    })
})

const isRecurringOnly = (item: Product) => {
    if (!item.bonusThreshold) return false
    const { once, weekly, monthly, quarterly, yearly } = item.bonusThreshold
    const hasRecurringThreshold = weekly !== undefined || monthly !== undefined || quarterly !== undefined || yearly !== undefined
    return hasRecurringThreshold && once === undefined
}

const hasAnyRecurring = computed(() => {
    return props.weeklyTotal > 0 || props.monthlyTotal > 0 || props.quarterlyTotal > 0 || props.yearlyTotal > 0
})

const isOnOneTimeTab = computed(() => {
    return props.oneTimeTotal > 0 && !hasAnyRecurring.value
})

const getUpsellMessage = (item: Product) => {
    if (!item.bonusThreshold) return ''
    const { once, weekly, monthly, quarterly, yearly } = item.bonusThreshold

    const options: string[] = []

    if (once !== undefined && props.enabledFrequencies.includes('once')) {
        const needed = Math.max(0, once - props.oneTimeTotal)
        if (needed > 0) options.push(`${currencySymbol.value}${needed} one-time`)
    }
    if (weekly !== undefined && props.enabledFrequencies.includes('weekly')) {
        const needed = Math.max(0, weekly - props.weeklyTotal)
        if (needed > 0) options.push(`${currencySymbol.value}${needed} weekly`)
    }
    if (monthly !== undefined && props.enabledFrequencies.includes('monthly')) {
        const needed = Math.max(0, monthly - props.monthlyTotal)
        if (needed > 0) options.push(`${currencySymbol.value}${needed} monthly`)
    }
    if (quarterly !== undefined && props.enabledFrequencies.includes('quarterly')) {
        const needed = Math.max(0, quarterly - props.quarterlyTotal)
        if (needed > 0) options.push(`${currencySymbol.value}${needed} quarterly`)
    }
    if (yearly !== undefined && props.enabledFrequencies.includes('yearly')) {
        const needed = Math.max(0, yearly - props.yearlyTotal)
        if (needed > 0) options.push(`${currencySymbol.value}${needed} yearly`)
    }

    if (options.length === 0) return 'Free gift unlocked!'
    if (options.length === 1) return `Add ${options[0]} to unlock!`
    if (options.length === 2) return `Add ${options[0]} or ${options[1]} to unlock!`

    const lastOption = options.pop()
    return `Add ${options.join(', ')}, or ${lastOption} to unlock!`
}

const getFirstRecurringFrequency = (item: Product): 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null => {
    if (!item.bonusThreshold) return null
    const { weekly, monthly, quarterly, yearly } = item.bonusThreshold

    // Check in order of preference: weekly, monthly, quarterly, yearly
    // Only return if both enabled AND has threshold
    if (weekly !== undefined && props.enabledFrequencies.includes('weekly')) return 'weekly'
    if (monthly !== undefined && props.enabledFrequencies.includes('monthly')) return 'monthly'
    if (quarterly !== undefined && props.enabledFrequencies.includes('quarterly')) return 'quarterly'
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

const toggleBonusItem = (itemId: string) => {
    emit('toggle', itemId)
}

const hasAnyBonusItems = computed(() => {
    return eligibleBonusItems.value.length > 0 || upsellBonusItems.value.length > 0
})

// Watch for changes in eligible items and auto-uncheck ineligible ones
watch(eligibleBonusItems, (newEligible) => {
    const eligibleIds = new Set(newEligible.map(item => item.id))

    // Find selected items that are no longer eligible
    Array.from(props.selectedBonusItems).forEach(itemId => {
        if (!eligibleIds.has(itemId)) {
            // Auto-uncheck by emitting toggle
            emit('toggle', itemId)
        }
    })
}, { deep: true })
</script>

<template>
    <div v-if="hasAnyBonusItems" class="space-y-4">
        <div class="border-b"></div>

        <!-- Eligible Bonus Items (Free Gifts) -->
        <div v-if="eligibleBonusItems.length > 0" class="space-y-2">
            <p class="text-sm font-medium text-muted-foreground">🎁 Free gifts available:</p>
            <div v-for="item in eligibleBonusItems" :key="`bonus-${item.id}`"
                class="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                <input type="checkbox" :id="`bonus-${item.id}`" :checked="selectedBonusItems.has(item.id)"
                    @change="toggleBonusItem(item.id)" class="h-4 w-4 rounded border-input" />
                <label :for="`bonus-${item.id}`" class="flex items-center gap-3 flex-1 cursor-pointer">
                    <div class="text-xl">{{ item.thumbnail }}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm truncate">{{ item.name }}</p>
                        <p class="text-xs text-success font-medium">FREE with your donation!</p>
                    </div>
                </label>
            </div>
        </div>

        <!-- Upsell for Bonus Items -->
        <div v-if="upsellBonusItems.length > 0" class="space-y-2">
            <div v-for="item in upsellBonusItems" :key="`upsell-${item.id}`"
                class="rounded-lg border border-dashed bg-card p-3">
                <div class="flex items-center gap-3">
                    <input type="checkbox" :id="`upsell-${item.id}`" disabled
                        class="h-4 w-4 rounded border-input opacity-50" />
                    <label :for="`upsell-${item.id}`" class="flex items-center gap-3 flex-1">
                        <div class="text-xl opacity-50">{{ item.thumbnail }}</div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-sm text-muted-foreground">{{ item.name }}</p>
                            <p class="text-xs text-primary font-medium">
                                {{ getUpsellMessage(item) }}
                                <button v-if="isRecurringOnly(item) && isOnOneTimeTab" type="button"
                                    @click="handleSwitchToRecurring(item)"
                                    class="underline hover:no-underline font-semibold">
                                    Switch to {{ getRecurringLabel(item) }}
                                </button>
                            </p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="border-b"></div>
    </div>
</template>
