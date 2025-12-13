<script setup lang="ts">
import { computed } from 'vue'

interface Product {
    id: string
    name: string
    description: string
    price: number
    minPrice?: number
    default?: number
    frequency: 'once' | 'monthly'
    image: string
    thumbnail: string
    icon: string
    isBonusItem?: boolean
    bonusThreshold?: {
        once: number
        monthly: number
    }
}

interface Props {
    bonusItems: Product[]
    selectedBonusItems: Set<string>
    recurringTotal: number
    oneTimeTotal: number
    currencySymbol?: string
}

interface Emits {
    (e: 'toggle', itemId: string): void
}

const props = withDefaults(defineProps<Props>(), {
    currencySymbol: '$'
})

const emit = defineEmits<Emits>()

const eligibleBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        return props.recurringTotal >= item.bonusThreshold.monthly ||
            props.oneTimeTotal >= item.bonusThreshold.once
    })
})

const upsellBonusItems = computed(() => {
    return props.bonusItems.filter(item => {
        if (!item.bonusThreshold) return false
        return props.recurringTotal < item.bonusThreshold.monthly &&
            props.oneTimeTotal < item.bonusThreshold.once
    })
})

const getUpsellMessage = (item: Product) => {
    if (!item.bonusThreshold) return ''
    const recurringNeeded = item.bonusThreshold.monthly - props.recurringTotal
    const oneTimeNeeded = item.bonusThreshold.once - props.oneTimeTotal

    if (recurringNeeded > 0 && oneTimeNeeded > 0) {
        const minNeeded = Math.min(recurringNeeded, oneTimeNeeded)
        return `Add ${props.currencySymbol}${minNeeded} more to unlock this free gift!`
    } else if (recurringNeeded > 0) {
        return `Add ${props.currencySymbol}${recurringNeeded} in monthly donations to unlock!`
    } else if (oneTimeNeeded > 0) {
        return `Add ${props.currencySymbol}${oneTimeNeeded} in one-time donations to unlock!`
    }
    return ''
}

const toggleBonusItem = (itemId: string) => {
    emit('toggle', itemId)
}

const hasAnyBonusItems = computed(() => {
    return eligibleBonusItems.value.length > 0 || upsellBonusItems.value.length > 0
})
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
                class="rounded-lg border border-dashed bg-card p-3 space-y-2">
                <div class="flex items-start gap-3">
                    <div class="text-xl opacity-50">{{ item.thumbnail }}</div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm text-muted-foreground">{{ item.name }}</p>
                        <p class="text-xs text-primary font-medium">{{ getUpsellMessage(item) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="border-b"></div>
    </div>
</template>
