<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import LogarithmicPriceSlider from '~/components/donation-form/common/LogarithmicPriceSlider.vue'

interface Props {
    modelValue: number
    amounts: number[]
    currency?: string
    minPrice?: number
    maxPrice?: number
    frequencyLabel?: string
}

interface Emits {
    (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    minPrice: 5,
    maxPrice: 1000,
    frequencyLabel: 'donation'
})

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<Emits>()

const localAmount = ref(props.modelValue)
const showSlider = ref(false)
const selectedAmount = ref<number | null>(null)
const isInternalUpdate = ref(false)

// Initialize based on modelValue
watch(() => props.modelValue, (newValue) => {
    if (isInternalUpdate.value) {
        isInternalUpdate.value = false
        return
    }

    localAmount.value = newValue
    // Check if modelValue matches one of the preset amounts
    if (props.amounts.includes(newValue)) {
        selectedAmount.value = newValue
        showSlider.value = false
    } else if (newValue > 0) {
        // Has a custom value, show slider
        selectedAmount.value = null
        showSlider.value = true
    } else {
        // No value selected
        selectedAmount.value = null
        showSlider.value = false
    }
}, { immediate: true })

// Emit changes to parent
watch(localAmount, (newValue) => {
    isInternalUpdate.value = true
    emit('update:modelValue', newValue)
})

const selectAmount = (amount: number) => {
    selectedAmount.value = amount
    localAmount.value = amount
    showSlider.value = false
}

const enableCustomAmount = () => {
    selectedAmount.value = null
    showSlider.value = true
    // Preserve current amount if set, otherwise use first preset or minimum
    if (localAmount.value === 0) {
        localAmount.value = props.amounts[0] || props.minPrice
    }
}

const backToPresets = () => {
    showSlider.value = false
    // Check if current amount matches a preset
    if (props.amounts.includes(localAmount.value)) {
        selectedAmount.value = localAmount.value
    } else {
        // Reset to no selection if custom amount doesn't match presets
        selectedAmount.value = null
        localAmount.value = 0
    }
}
</script>

<template>
    <div class="space-y-3">
        <!-- Selected Amount Display - Always on top -->
        <div class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">Your {{ frequencyLabel }}</p>
            <p v-if="localAmount > 0" class="text-3xl font-bold">{{ currencySymbol }}{{ localAmount }}</p>
            <p v-else class="text-lg text-muted-foreground">Select amount below</p>
        </div>

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
        </div>

        <!-- Custom Amount Slider -->
        <div v-else class="space-y-3">
            <LogarithmicPriceSlider v-model="localAmount" :min-price="minPrice" :max-price="maxPrice"
                :currency="currency" />

            <!-- Back to Preset Amounts Button -->
            <Button variant="outline" class="w-full" @click="backToPresets">
                Back to preset amounts
            </Button>
        </div>
    </div>
</template>
