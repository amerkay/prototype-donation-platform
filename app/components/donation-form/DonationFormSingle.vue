<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import AmountSelector from '~/components/donation-form/common/AmountSelector.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import RewardsSection from '~/components/donation-form/common/RewardsSection.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import TributeCard from '~/components/donation-form/tribute/TributeCard.vue'
import TributeModal from '~/components/donation-form/tribute/TributeModal.vue'
import ProductSelectorButton from '~/components/donation-form/product-selector/ProductSelectorButton.vue'
import type { Product, TributeData, FormConfig } from '@/lib/common/types'

const { selectedRewards, toggleReward } = useCart()

interface Props {
  frequency: 'once' | 'monthly' | 'yearly'
  frequencyLabel: string
  currency: string
  donationAmount: number
  selectedProduct: Product | null
  tributeData: TributeData | undefined
  rewards: Product[]
  products: Product[]
  availableAmounts: number[]
  minPrice: number
  maxPrice: number
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  formConfig: FormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:donationAmount': [value: number]
  'product-select': [product: Product]
  'remove-product': []
  'tribute-save': [tributeData: TributeData | undefined]
  'remove-tribute': []
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly', openModal?: boolean]
}>()

// Refs
const productSelectorRef = ref<InstanceType<typeof ProductSelectorButton> | null>(null)
const tributeModalRef = ref<InstanceType<typeof TributeModal> | null>(null)

// Computed
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

const handleOpenTributeModal = () => {
  tributeModalRef.value?.open(props.tributeData)
}

const handleTributeSave = (data: TributeData | undefined) => {
  emit('tribute-save', data)
}

const openProductModal = () => {
  productSelectorRef.value?.openProductModal()
}

defineExpose({
  openProductModal
})
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

    <!-- Product Selector -->
    <ProductSelectorButton
      ref="productSelectorRef"
      :frequency="frequency"
      :currency="currency"
      :price="donationAmount"
      :selected-product="selectedProduct"
      :products="products"
      :selector-config="formConfig.features.productSelector"
      :tribute-config="formConfig.features.tribute"
      @product-select="emit('product-select', $event)"
      @remove-product="emit('remove-product')"
      @switch-to-tab="emit('switch-to-tab', $event)"
    />

    <!-- Gift or In Memory (only for recurring donations) -->
    <TributeCard
      v-if="showTributeSection && hasTribute"
      :tribute="tributeData!"
      :config="formConfig.features.tribute"
      @edit="handleOpenTributeModal"
      @remove="emit('remove-tribute')"
    />
    <Button
      v-else-if="showTributeSection"
      variant="outline"
      class="w-full h-10 text-sm"
      @click="handleOpenTributeModal"
    >
      💝 Gift or In Memory of (with eCard)
    </Button>

    <!-- Rewards Section -->
    <RewardsSection
      :rewards="rewards"
      :selected-rewards="selectedRewards"
      :one-time-total="oneTimeTotal"
      :monthly-total="monthlyTotal"
      :yearly-total="yearlyTotal"
      :enabled-frequencies="enabledFrequencies"
      :currency="currency"
      :selected-frequency="frequency === 'yearly' ? 'monthly' : frequency"
      :rewards-config="formConfig.features.rewards"
      @toggle="toggleReward"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Shipping Notice -->
    <ShippingNotice
      :selected-frequency="frequency === 'yearly' ? 'monthly' : frequency"
      :products="products"
      :selected-rewards="selectedRewards"
      :multiple-cart="[]"
      :donation-amounts="{ once: oneTimeTotal, monthly: monthlyTotal, yearly: yearlyTotal }"
      :shipping-notice-config="formConfig.features.shippingNotice"
    />

    <!-- Next Button -->
    <NextButton :disabled="!isFormValid" @click="emit('next')" />

    <!-- Modals -->
    <TributeModal
      ref="tributeModalRef"
      :config="formConfig.features.tribute"
      @save="handleTributeSave"
    />
  </div>
</template>
