<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import LogarithmicPriceSlider from '~/features/donation-form/donor/components/LogarithmicPriceSlider.vue'
import type { PresetAmount } from '~/features/donation-form/shared/types'

interface Props {
  modelValue: number
  amounts: PresetAmount[] // Always PresetAmount[] for consistency
  currency?: string
  minPrice?: number
  maxPrice?: number
  frequencyLabel?: string
  frequency?: 'once' | 'monthly' | 'yearly'
  showDescriptions?: boolean // Whether to show descriptions
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'USD',
  minPrice: 5,
  maxPrice: 1000,
  frequencyLabel: 'donation',
  frequency: 'once',
  showDescriptions: false
})

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const emit = defineEmits<Emits>()

const localAmount = ref(props.modelValue)
const showSlider = ref(false)
const selectedAmount = ref<number | null>(null)

// Extract amounts as numbers for logic
const normalizedAmounts = computed(() => {
  return props.amounts.map((item) => item.amount)
})

// Initialize based on modelValue
watch(
  () => props.modelValue,
  (newValue, oldValue) => {
    localAmount.value = newValue

    // Always sync selectedAmount when value matches a preset
    if (normalizedAmounts.value.includes(newValue)) {
      selectedAmount.value = newValue
    } else {
      selectedAmount.value = null
    }

    // Only auto-switch mode on initial load (oldValue === undefined)
    // Don't interfere when user is actively using the slider
    if (oldValue === undefined) {
      if (normalizedAmounts.value.includes(newValue)) {
        showSlider.value = false
      } else if (newValue > 0) {
        showSlider.value = true
      } else {
        showSlider.value = false
      }
    }
  },
  { immediate: true }
)

// Emit changes to parent only when localAmount changes internally
watch(localAmount, (newValue, oldValue) => {
  // Skip initial setup and when value hasn't actually changed
  if (oldValue !== undefined && newValue !== props.modelValue) {
    emit('update:modelValue', newValue)
  }
})

const selectAmount = (amount: number) => {
  selectedAmount.value = amount
  localAmount.value = amount
  showSlider.value = false
}

const enableCustomAmount = () => {
  selectedAmount.value = null
  showSlider.value = true
  // Preserve current amount if set, otherwise use minimum price
  if (localAmount.value === 0) {
    localAmount.value = props.minPrice
  }
}

const backToPresets = () => {
  showSlider.value = false
  // Check if current amount matches a preset
  if (normalizedAmounts.value.includes(localAmount.value)) {
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
    <!-- Preset Amounts - Button Grid (without descriptions) -->
    <div v-if="!showSlider && !showDescriptions" class="space-y-3">
      <div class="grid grid-cols-3 gap-3">
        <Button
          v-for="amount in normalizedAmounts"
          :key="amount"
          :variant="selectedAmount === amount ? 'default' : 'outline'"
          class="h-14 text-lg font-semibold"
          @click="selectAmount(amount)"
        >
          {{ currencySymbol }}{{ amount }}
        </Button>
      </div>
    </div>

    <!-- Preset Amounts - Stacked Cards (with descriptions) -->
    <div v-if="!showSlider && showDescriptions" class="space-y-3">
      <Card
        v-for="item in amounts"
        :key="item.amount"
        class="cursor-pointer transition-all hover:border-primary py-0 rounded-lg overflow-hidden"
        :class="{
          'border-primary border-2 bg-primary/5': selectedAmount === item.amount,
          border: selectedAmount !== item.amount
        }"
        @click="selectAmount(item.amount)"
      >
        <div class="pr-4 flex items-center gap-4">
          <!-- Image (square) -->
          <div class="size-12 shrink-0 bg-muted">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.shortText || `${currencySymbol}${item.amount}`"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-muted-foreground"
            >
              <span class="text-2xl">{{ currencySymbol }}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-xl font-bold">{{ currencySymbol }}{{ item.amount }}</p>
              <p v-if="item.shortText" class="text-sm text-muted-foreground truncate">
                {{ item.shortText }}
              </p>
            </div>
          </div>

          <!-- Selection indicator -->
          <div
            v-if="selectedAmount === item.amount"
            class="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0"
          >
            <Icon name="heroicons:check-20-solid" class="h-4 w-4 text-primary-foreground" />
          </div>
        </div>
      </Card>
    </div>

    <!-- Custom Amount Button (shared between both preset modes) -->
    <Button
      v-if="!showSlider"
      variant="outline"
      class="h-12 w-full font-semibold"
      @click="enableCustomAmount"
    >
      Custom Amount
    </Button>

    <!-- Custom Amount Slider -->
    <div v-else-if="showSlider" class="space-y-3">
      <!-- Selected Amount Display -->
      <div class="rounded-lg bg-muted p-4 text-center">
        <p class="text-sm text-muted-foreground">Your {{ frequencyLabel }}</p>
        <p v-if="localAmount > 0" class="text-3xl font-bold">
          {{ currencySymbol }}{{ localAmount }}
        </p>
        <p v-else class="text-lg text-muted-foreground">Select amount below</p>
      </div>

      <LogarithmicPriceSlider
        v-model="localAmount"
        :min-price="minPrice"
        :max-price="maxPrice"
        :default-value="localAmount"
        :currency="currency"
        :frequency="frequency"
      />

      <!-- Back to Preset Amounts Button -->
      <Button variant="outline" class="w-full" @click="backToPresets">
        Back to preset amounts
      </Button>
    </div>
  </div>
</template>
