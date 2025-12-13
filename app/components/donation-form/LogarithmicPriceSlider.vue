<script setup lang="ts">
import { computed, ref } from 'vue'
import { Slider } from '@/components/ui/slider'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'

interface Props {
    modelValue: number
    minPrice: number
    maxPrice?: number
    defaultValue?: number
    currency?: string
}

const props = withDefaults(defineProps<Props>(), {
    maxPrice: 1000,
    currency: 'USD'
})

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<{
    'update:modelValue': [value: number]
}>()

const isCustomMode = ref(false)
const customInputValue = ref(props.modelValue.toString())

// Logarithmic scale breakpoints: 1-10 (by 1), 10-25 (by 5), 25-200 (by 25), 200-500 (by 100), 500-1000 (by 250)
const createPriceSteps = (minPrice: number, maxPrice: number) => {
    const steps: number[] = []

    // From minPrice to 10 in steps of 1
    const start = Math.max(minPrice, 1)
    for (let i = start; i <= Math.min(10, maxPrice); i += 1) {
        steps.push(i)
    }

    // From 10 to 25 in steps of 5
    if (maxPrice > 10) {
        for (let i = 15; i <= Math.min(25, maxPrice); i += 5) {
            steps.push(i)
        }
    }

    // From 25 to 200 in steps of 25
    if (maxPrice > 25) {
        for (let i = 50; i <= Math.min(200, maxPrice); i += 25) {
            steps.push(i)
        }
    }

    // From 200 to 500 in steps of 100
    if (maxPrice > 200) {
        for (let i = 300; i <= Math.min(500, maxPrice); i += 100) {
            steps.push(i)
        }
    }

    // From 500 to 1000 in steps of 250
    if (maxPrice > 500) {
        for (let i = 750; i <= maxPrice; i += 250) {
            steps.push(i)
        }
    }

    return steps
}

const priceToSliderValue = (price: number, steps: number[]) => {
    const closestIndex = steps.reduce((prev, curr, idx) => {
        const prevValue = steps[prev]
        return prevValue !== undefined && Math.abs(curr - price) < Math.abs(prevValue - price) ? idx : prev
    }, 0)
    return closestIndex
}

const sliderValueToPrice = (sliderValue: number | undefined, steps: number[]) => {
    if (sliderValue === undefined) return 0
    const price = steps[Math.round(sliderValue)]
    return price ?? steps[steps.length - 1] ?? 0
}

const steps = computed(() => createPriceSteps(props.minPrice, props.maxPrice))

const sliderValue = computed(() => priceToSliderValue(props.modelValue, steps.value))

const handleSliderChange = (value: number[] | undefined) => {
    const sliderVal = value?.[0]
    if (sliderVal !== undefined) {
        const newPrice = sliderValueToPrice(sliderVal, steps.value)
        if (newPrice > 0) {
            emit('update:modelValue', newPrice)
        }
    }
}

const toggleCustomMode = () => {
    isCustomMode.value = !isCustomMode.value
    if (isCustomMode.value) {
        customInputValue.value = props.modelValue.toString()
    }
}

const handleCustomInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = parseInt(target.value, 10)

    if (!isNaN(value) && value >= props.minPrice) {
        emit('update:modelValue', value)
        customInputValue.value = target.value
    }
}

const handleCustomBlur = () => {
    const value = parseInt(customInputValue.value, 10)

    if (isNaN(value) || value < props.minPrice) {
        customInputValue.value = props.minPrice.toString()
        emit('update:modelValue', props.minPrice)
    }
}
</script>

<template>
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <span v-if="!isCustomMode" class="text-sm font-semibold">
                {{ currencySymbol }}{{ modelValue }}
                <span class="text-xs text-muted-foreground">/mo</span>
            </span>
            <InputGroup v-else class="w-auto">
                <InputGroupAddon>
                    <InputGroupText>{{ currencySymbol }}</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput v-model="customInputValue" type="number" :min="minPrice" class="w-24"
                    @input="handleCustomInput" @blur="handleCustomBlur" />
                <InputGroupAddon align="inline-end">
                    <InputGroupText>/mo</InputGroupText>
                </InputGroupAddon>
            </InputGroup>
            <button type="button" class="text-xs text-primary hover:underline" @click="toggleCustomMode">
                {{ isCustomMode ? 'Use slider' : 'Custom amount' }}
            </button>
        </div>
        <Slider v-if="!isCustomMode" :model-value="[sliderValue]" :min="0" :max="steps.length - 1" :step="1"
            @update:model-value="handleSliderChange" 
            class="**:data-[slot=slider-track]:h-2.5 **:data-[slot=slider-thumb]:size-6" />
        <div v-if="!isCustomMode" class="flex justify-between text-xs text-muted-foreground">
            <span>{{ currencySymbol }}{{ minPrice }}</span>
            <span>{{ currencySymbol }}{{ maxPrice }}</span>
        </div>
        <div v-else class="text-xs text-muted-foreground">
            Min: {{ currencySymbol }}{{ minPrice }}
        </div>
    </div>
</template>
