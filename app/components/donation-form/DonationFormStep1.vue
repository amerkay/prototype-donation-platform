<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Settings
const currencies = [
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
]

const frequencies = [
    { value: 'once', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
    // { value: 'yearly', label: 'Yearly' },
]

const amounts = {
    USD: {
        once: [25, 50, 100, 250, 500, 1000],
        monthly: [10, 25, 50, 100, 200, 300],
        yearly: [100, 250, 500, 1000, 2500],
    },
    EUR: {
        once: [20, 45, 90, 225, 450, 900],
        monthly: [9, 22, 45, 90, 180, 250],
        yearly: [90, 225, 450, 900, 2250],
    },
    GBP: {
        once: [20, 40, 80, 200, 400, 800],
        monthly: [8, 20, 40, 80, 160, 250],
        yearly: [80, 200, 400, 800, 2000],
    },
}

// State
const selectedCurrency = ref('USD')
const selectedFrequency = ref('once')
const selectedAmount = ref<number | null>(null)
const customAmount = ref('')
const isCustom = ref(false)

// Computed
const currentCurrency = computed(() =>
    currencies.find(c => c.value === selectedCurrency.value)
)

const availableAmounts = computed(() =>
    amounts[selectedCurrency.value as keyof typeof amounts][selectedFrequency.value as keyof typeof amounts.USD]
)

const displayAmount = computed(() => {
    const amount = isCustom.value ? customAmount.value : selectedAmount.value
    return amount ? `${currentCurrency.value?.symbol}${amount}` : ''
})

// Methods
const selectAmount = (amount: number) => {
    selectedAmount.value = amount
    isCustom.value = false
    customAmount.value = ''
}

const enableCustomAmount = () => {
    isCustom.value = true
    selectedAmount.value = null
}

const handleCustomAmountInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    customAmount.value = value.replace(/[^0-9.]/g, '')
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header with Currency Selector -->
        <div class="flex items-start justify-between gap-2">
            <div>
                <h2 class="text-xl font-semibold">Make a Donation</h2>
                <p class="text-sm text-muted-foreground">Choose your donation amount</p>
            </div>
            <div class="flex items-center gap-2 justify-end">
                <Label for="currency" class="hidden md:inline-block text-sm">Currency</Label>
                <select id="currency" v-model="selectedCurrency"
                    class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
                    <option v-for="currency in currencies" :key="currency.value" :value="currency.value">
                        {{ currency.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Frequency Tabs -->
        <!-- Frequency Tabs -->
        <Tabs v-model="selectedFrequency">
            <TabsList class="grid w-full h-12" :class="{
                'grid-cols-1': frequencies.length === 1,
                'grid-cols-2': frequencies.length === 2,
                'grid-cols-3': frequencies.length === 3,
            }">
                <TabsTrigger v-for="freq in frequencies" :key="freq.value" :value="freq.value" class="text-base">
                    {{ freq.label }}
                </TabsTrigger>
            </TabsList>

            <TabsContent v-for="freq in frequencies" :key="freq.value" :value="freq.value" class="mt-6 space-y-4">
                <!-- Preset Amounts -->
                <div class="grid grid-cols-3 gap-3">
                    <Button v-for="amount in availableAmounts" :key="amount"
                        :variant="selectedAmount === amount && !isCustom ? 'default' : 'outline'"
                        class="h-14 text-lg font-semibold" @click="selectAmount(amount)">
                        {{ currentCurrency?.symbol }}{{ amount }}
                    </Button>
                </div>

                <!-- Custom Amount -->
                <div class="space-y-2">
                    <Button :variant="isCustom ? 'default' : 'outline'" class="h-14 w-full text-lg font-semibold"
                        @click="enableCustomAmount">
                        Custom Amount
                    </Button>

                    <div v-if="isCustom" class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                            {{ currentCurrency?.symbol }}
                        </span>
                        <Input v-model="customAmount" type="text" inputmode="decimal" placeholder="0.00"
                            class="h-12 pl-8 text-lg" @input="handleCustomAmountInput" />
                    </div>
                </div>

                <!-- Summary -->
                <div v-if="displayAmount" class="rounded-lg bg-muted p-4 text-center">
                    <p class="text-sm text-muted-foreground">Your {{ freq.label.toLowerCase() }} donation</p>
                    <p class="text-3xl font-bold">{{ displayAmount }}</p>
                </div>
            </TabsContent>
        </Tabs>
    </div>
</template>
