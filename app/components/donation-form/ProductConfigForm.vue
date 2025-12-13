<script setup lang="ts">
import { ref, watch } from 'vue'
import LogarithmicPriceSlider from '@/components/donation-form/LogarithmicPriceSlider.vue'

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
    product: Product | null
    currency?: string
    initialPrice?: number
    maxPrice?: number
}

interface Emits {
    (e: 'update:price', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: '$',
    initialPrice: 0,
    maxPrice: 1000
})

const emit = defineEmits<Emits>()

const localPrice = ref(props.initialPrice)

// Only watch initialPrice changes to reset when modal reopens
watch(() => props.initialPrice, (newPrice) => {
    localPrice.value = newPrice
}, { immediate: true })

// Emit price changes to parent
watch(localPrice, (newPrice) => {
    emit('update:price', newPrice)
})

const isRecurring = computed(() => props.product?.frequency === 'monthly')
const hasSlider = computed(() => isRecurring.value && props.product?.minPrice !== undefined)
</script>

<template>
    <div class="space-y-4">
        <!-- One-time price display -->
        <div v-if="!hasSlider" class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">One-time donation</p>
            <p class="text-3xl font-bold">{{ currency }}{{ product?.price }}</p>
        </div>

        <!-- Recurring price slider -->
        <div v-else class="space-y-3">
            <div class="rounded-lg bg-muted p-3 text-center">
                <p class="text-sm text-muted-foreground">Monthly donation</p>
                <p class="text-2xl font-bold">{{ currency }}{{ localPrice }}/month</p>
            </div>

            <LogarithmicPriceSlider v-model="localPrice" :min-price="product?.minPrice ?? 0"
                :default-value="product?.default" :max-price="maxPrice" :currency="currency" />
        </div>
    </div>
</template>
