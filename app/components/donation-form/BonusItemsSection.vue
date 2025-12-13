<script setup lang="ts">
import { computed, watch } from 'vue'

interface Product {
    id: string
    name: string
    description: string
    price?: number
    minPrice?: number
    default?: number
    frequency: 'once' | 'monthly'
    image: string
    thumbnail: string
    icon: string
    isBonusItem?: boolean
    bonusThreshold?: {
        once?: number
        monthly?: number
    }
}

interface Props {
    bonusItems: Product[]
    selectedBonusItems: Set<string>
    recurringTotal: number
    oneTimeTotal: number
    currency?: string
}

interface Emits {
    (e: 'toggle', itemId: string): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD'
})

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<Emits>()

const eligibleBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        const { once, monthly } = item.bonusThreshold

        // If both thresholds exist, either can unlock the item
        if (once !== undefined && monthly !== undefined) {
            return props.oneTimeTotal >= once || props.recurringTotal >= monthly
        }
        // If only one threshold exists, check that specific one
        if (once !== undefined) return props.oneTimeTotal >= once
        if (monthly !== undefined) return props.recurringTotal >= monthly
        return false
    })
})

const upsellBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        const { once, monthly } = item.bonusThreshold

        // If both thresholds exist, show upsell only if both are not met
        if (once !== undefined && monthly !== undefined) {
            return props.oneTimeTotal < once && props.recurringTotal < monthly
        }
        // If only one threshold exists, show upsell if that one is not met
        if (once !== undefined) return props.oneTimeTotal < once
        if (monthly !== undefined) return props.recurringTotal < monthly
        return false
    })
})

const getUpsellMessage = (item: Product) => {
    if (!item.bonusThreshold) return ''
    const { once, monthly } = item.bonusThreshold

    if (once !== undefined && monthly !== undefined) {
        const oneTimeNeeded = Math.max(0, once - props.oneTimeTotal)
        const recurringNeeded = Math.max(0, monthly - props.recurringTotal)

        // Both amounts needed
        if (oneTimeNeeded > 0 && recurringNeeded > 0) {
            return `Add ${currencySymbol.value}${oneTimeNeeded} one-time or ${currencySymbol.value}${recurringNeeded} monthly to unlock!`
        }
        // Already met one threshold
        return 'Free gift unlocked!'
    } else if (monthly !== undefined) {
        const recurringNeeded = Math.max(0, monthly - props.recurringTotal)
        return `Add ${currencySymbol.value}${recurringNeeded} in monthly donations to unlock!`
    } else if (once !== undefined) {
        const oneTimeNeeded = Math.max(0, once - props.oneTimeTotal)
        return `Add ${currencySymbol.value}${oneTimeNeeded} in one-time donations to unlock!`
    }
    return ''
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
                            <p class="text-xs text-primary font-medium">{{ getUpsellMessage(item) }}</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="border-b"></div>
    </div>
</template>
