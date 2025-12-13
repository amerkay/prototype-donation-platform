<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
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
const showSlider = ref(false)
const selectedAmount = ref<number | null>(null)

// Only watch initialPrice changes to reset when modal reopens
watch(() => props.initialPrice, (newPrice) => {
    localPrice.value = newPrice
    // Check if initialPrice matches one of the preset amounts
    if (props.amounts.includes(newPrice)) {
        selectedAmount.value = newPrice
        showSlider.value = false
    } else {
        // If price doesn't match presets, show slider directly
        selectedAmount.value = null
        showSlider.value = props.amounts.length > 0 && newPrice > 0
    }
}, { immediate: true })

// Emit price changes to parent
watch(localPrice, (newPrice) => {
    emit('update:price', newPrice)
})

const isRecurring = computed(() => props.product?.frequency === 'monthly')
const hasPresetAmounts = computed(() => isRecurring.value && props.amounts.length > 0)

const selectAmount = (amount: number) => {
    selectedAmount.value = amount
    localPrice.value = amount
    showSlider.value = false
}

const enableCustomAmount = () => {
    showSlider.value = true
    selectedAmount.value = null
}
</script>

<template>
    <div class="space-y-4">
        <!-- One-time price display -->
        <div v-if="!isRecurring" class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">One-time donation</p>
            <p class="text-3xl font-bold">{{ currencySymbol }}{{ product?.price }}</p>
        </div>

        <!-- Recurring price with preset amounts -->
        <div v-else-if="hasPresetAmounts">
            <!-- Preset Amounts Grid -->
            <div v-if="!showSlider" class="space-y-3">
                <div class="grid grid-cols-3 gap-3">
                    <Button v-for="amount in amounts" :key="amount"
                        :variant="selectedAmount === amount ? 'default' : 'outline'" class="h-14 text-lg font-semibold"
                        @click="selectAmount(amount)">
                        {{ currencySymbol }}{{ amount }}
                    </Button>
                </div>

                <!-- Custom Amount Button -->
                <Button variant="outline" class="h-14 w-full text-lg font-semibold" @click="enableCustomAmount">
                    Custom Amount
                </Button>

                <!-- Selected Amount Display -->
                <div v-if="selectedAmount" class="rounded-lg bg-muted p-3 text-center">
                    <p class="text-sm text-muted-foreground">Monthly donation</p>
                    <p class="text-2xl font-bold">{{ currencySymbol }}{{ selectedAmount }}/month</p>
                </div>
            </div>

            <!-- Custom Amount Slider -->
            <div v-else class="space-y-3">
                <div class="rounded-lg bg-muted p-3 text-center">
                    <p class="text-sm text-muted-foreground">Monthly donation</p>
                    <p class="text-2xl font-bold">{{ currencySymbol }}{{ localPrice }}/month</p>
                </div>

                <LogarithmicPriceSlider v-model="localPrice" :min-price="product?.minPrice ?? 0"
                    :default-value="product?.default" :max-price="maxPrice" :currency="currency" />

                <!-- Back to Preset Amounts Button -->
                <Button variant="outline" class="w-full" @click="showSlider = false">
                    Back to preset amounts
                </Button>
            </div>
        </div>

        <!-- Fallback: If recurring but no preset amounts, show slider directly -->
        <div v-else-if="isRecurring" class="space-y-3">
            <div class="rounded-lg bg-muted p-3 text-center">
                <p class="text-sm text-muted-foreground">Monthly donation</p>
                <p class="text-2xl font-bold">{{ currencySymbol }}{{ localPrice }}/month</p>
            </div>

            <LogarithmicPriceSlider v-model="localPrice" :min-price="product?.minPrice ?? 0"
                :default-value="product?.default" :max-price="maxPrice" :currency="currency" />
        </div>
    </div>
</template>
