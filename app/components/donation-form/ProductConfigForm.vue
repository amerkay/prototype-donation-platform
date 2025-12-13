<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import DonationAmountSelector from '@/components/donation-form/DonationAmountSelector.vue'

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
    product: Product | null
    currency?: string
    initialPrice?: number
    maxPrice?: number
    amounts?: number[]
}

interface Emits {
    (e: 'update:price', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    initialPrice: 0,
    maxPrice: 1000,
    amounts: () => []
})

const emit = defineEmits<Emits>()

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const localPrice = ref(props.initialPrice)

// Watch initialPrice changes to reset when modal reopens
watch(() => props.initialPrice, (newPrice) => {
    localPrice.value = newPrice
}, { immediate: true })

// Emit price changes to parent
watch(localPrice, (newPrice) => {
    emit('update:price', newPrice)
})

const isRecurring = computed(() => props.product?.frequency === 'monthly')
const hasPresetAmounts = computed(() => isRecurring.value && props.amounts.length > 0)
const frequencyLabel = computed(() =>
    isRecurring.value ? 'monthly donation' : 'one-time donation'
)
</script>

<template>
    <div class="space-y-4">
        <!-- One-time fixed price display -->
        <div v-if="!isRecurring" class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">One-time donation</p>
            <p class="text-3xl font-bold">{{ currencySymbol }}{{ product?.price }}</p>
        </div>

        <!-- Recurring with preset amounts - use DonationAmountSelector -->
        <DonationAmountSelector v-else-if="hasPresetAmounts" v-model="localPrice" :amounts="amounts"
            :currency="currency" :min-price="product?.minPrice ?? 0" :max-price="maxPrice"
            :frequency-label="frequencyLabel" />

        <!-- Recurring without preset amounts - use DonationAmountSelector with empty amounts -->
        <DonationAmountSelector v-else-if="isRecurring" v-model="localPrice" :amounts="[]" :currency="currency"
            :min-price="product?.minPrice ?? 0" :max-price="maxPrice" :frequency-label="frequencyLabel" />
    </div>
</template>
