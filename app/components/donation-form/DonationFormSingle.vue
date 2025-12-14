<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import AmountSelector from '~/components/donation-form/common/AmountSelector.vue'
import CartProductLine from '~/components/donation-form/cart/CartProductLine.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import BonusItemsSection from '~/components/donation-form/common/BonusItemsSection.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import TributeCard from '~/components/donation-form/tribute/TributeCard.vue'
import type { Product, TributeData } from '@/lib/common/types'

const { selectedBonusItems, toggleBonusItem } = useCart()

interface Props {
  frequency: 'once' | 'monthly' | 'yearly'
  frequencyLabel: string
  currency: string
  donationAmount: number
  selectedAdoption: Product | null
  tributeData: TributeData | undefined
  bonusItems: Product[]
  products: Product[]
  availableAmounts: number[]
  minPrice: number
  maxPrice: number
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:donationAmount': [value: number]
  'edit-adoption': []
  'remove-adoption': []
  'open-tribute': []
  'remove-tribute': []
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly']
}>()

// Computed
const adoptionButtonText = computed(() =>
  props.frequency === 'once'
    ? props.config.adoptionFeature.buttonTextOnce
    : props.config.adoptionFeature.buttonText
)

const showTributeSection = computed(() => props.frequency !== 'once')

const hasTribute = computed(
  () => props.tributeData?.type !== 'none' && props.tributeData !== undefined
)

const isFormValid = computed(() => props.donationAmount > 0)

const oneTimeTotal = computed(() => (props.frequency === 'once' ? props.donationAmount : 0))
const monthlyTotal = computed(() => (props.frequency === 'monthly' ? props.donationAmount : 0))
const yearlyTotal = computed(() => (props.frequency === 'yearly' ? props.donationAmount : 0))

// Methods
const handleAmountUpdate = (value: number) => {
  emit('update:donationAmount', value)
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly') => {
  emit('switch-to-tab', tab)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Donation Amount Selector -->
    <AmountSelector
      :model-value="donationAmount"
      :amounts="availableAmounts"
      :currency="currency"
      :min-price="minPrice"
      :max-price="maxPrice"
      :frequency-label="frequencyLabel.toLowerCase() + ' donation'"
      :frequency="frequency"
      @update:model-value="handleAmountUpdate"
    />

    <!-- Adopt an Orangutan - Show selected adoption or button -->
    <CartProductLine
      v-if="selectedAdoption"
      :item="selectedAdoption"
      :currency="currency"
      :price="donationAmount"
      @edit="emit('edit-adoption')"
      @remove="emit('remove-adoption')"
    />
    <Button
      v-else
      variant="outline"
      class="w-full h-12 text-sm border-2 border-primary/50 hover:border-primary hover:bg-primary/5 font-bold"
      @click="emit('edit-adoption')"
    >
      {{ adoptionButtonText }}
    </Button>

    <!-- Gift or In Memory (only for recurring donations) -->
    <TributeCard
      v-if="showTributeSection && hasTribute"
      :tribute="tributeData!"
      @edit="emit('open-tribute')"
      @remove="emit('remove-tribute')"
    />
    <Button
      v-else-if="showTributeSection"
      variant="outline"
      class="w-full h-10 text-sm"
      @click="emit('open-tribute')"
    >
      💝 Gift or In Memory of (with eCard)
    </Button>

    <!-- Bonus Items Section -->
    <!-- Bonus Items Section -->
    <BonusItemsSection
      :bonus-items="bonusItems"
      :selected-bonus-items="selectedBonusItems"
      :one-time-total="oneTimeTotal"
      :monthly-total="monthlyTotal"
      :yearly-total="yearlyTotal"
      :enabled-frequencies="enabledFrequencies"
      :currency="currency"
      :selected-frequency="frequency === 'yearly' ? 'monthly' : frequency"
      :free-gifts-label="config.bonusItemsSection.freeGiftsLabel"
      :free-with-donation-label="config.bonusItemsSection.freeWithDonationLabel"
      :one-time-label="config.bonusItemsSection.oneTimeLabel"
      :monthly-label="config.bonusItemsSection.monthlyLabel"
      :yearly-label="config.bonusItemsSection.yearlyLabel"
      :add-to-unlock-single-template="config.bonusItemsSection.addToUnlockSingleTemplate"
      :add-to-unlock-pair-template="config.bonusItemsSection.addToUnlockPairTemplate"
      :add-to-unlock-list-template="config.bonusItemsSection.addToUnlockListTemplate"
      :switch-to-template="config.bonusItemsSection.switchToTemplate"
      @toggle="toggleBonusItem"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Shipping Notice -->
    <ShippingNotice
      :selected-frequency="frequency === 'yearly' ? 'monthly' : frequency"
      :products="products"
      :selected-bonus-items="selectedBonusItems"
      :multiple-cart="[]"
      :donation-amounts="{ once: oneTimeTotal, monthly: monthlyTotal, yearly: yearlyTotal }"
      :message="config.shippingNotice.message"
    />

    <!-- Next Button -->
    <NextButton :disabled="!isFormValid" @click="emit('next')" />
  </div>
</template>
