<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import AmountSelector from '~/components/donation-form/common/AmountSelector.vue'
import CartProductLine from '~/components/donation-form/cart/CartProductLine.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import RewardsSection from '~/components/donation-form/common/RewardsSection.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import TributeCard from '~/components/donation-form/tribute/TributeCard.vue'
import TributeModal from '~/components/donation-form/tribute/TributeModal.vue'
import ProductSelectModal from '~/components/donation-form/product/ProductSelectModal.vue'
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
const productModalRef = ref<InstanceType<typeof ProductSelectModal> | null>(null)
const tributeModalRef = ref<InstanceType<typeof TributeModal> | null>(null)

// Computed
const productButtonText = computed(() =>
  props.frequency === 'once'
    ? props.formConfig.features.productSelector.config.ui.buttonTextOnce
    : props.formConfig.features.productSelector.config.ui.buttonText
)

const showTributeSection = computed(() => props.frequency !== 'once')

const hasTribute = computed(
  () => props.tributeData?.type !== 'none' && props.tributeData !== undefined
)

const isFormValid = computed(() => props.donationAmount > 0)

const oneTimeTotal = computed(() => (props.frequency === 'once' ? props.donationAmount : 0))
const monthlyTotal = computed(() => (props.frequency === 'monthly' ? props.donationAmount : 0))
const yearlyTotal = computed(() => (props.frequency === 'yearly' ? props.donationAmount : 0))

const selectorProducts = computed(() => {
  return props.products.filter((p) => !p.isReward && p.frequency === props.frequency)
})

const productModalTitle = computed(
  () => props.formConfig.features.productSelector.config.ui.modalTitle
)

const productModalDescription = computed(() =>
  props.formConfig.features.productSelector.config.ui.modalDescriptionTemplate.replace(
    '{frequency}',
    props.frequency
  )
)

const productNoProductsMessage = computed(() =>
  props.formConfig.features.productSelector.config.ui.noProductsTemplate.replace(
    '{frequency}',
    props.frequency
  )
)

// Methods
const handleAmountUpdate = (value: number) => {
  emit('update:donationAmount', value)
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly') => {
  emit('switch-to-tab', tab)
}

const handleEditProduct = () => {
  // If on "once" tab and button text mentions "Monthly", switch to monthly tab first
  if (props.frequency === 'once' && productButtonText.value.includes('Monthly')) {
    emit('switch-to-tab', 'monthly', true)
  } else {
    productModalRef.value?.open()
  }
}

const handleProductSelect = (product: Product) => {
  emit('product-select', product)
}

const handleOpenTributeModal = () => {
  tributeModalRef.value?.open(props.tributeData)
}

const handleTributeSave = (data: TributeData | undefined) => {
  emit('tribute-save', data)
}

const openProductModal = () => {
  productModalRef.value?.open()
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

    <!-- Product Selector - Show selected product or button -->
    <CartProductLine
      v-if="selectedProduct"
      :item="selectedProduct"
      :currency="currency"
      :price="donationAmount"
      :tribute-config="formConfig.features.tribute"
      @edit="handleEditProduct"
      @remove="emit('remove-product')"
    />
    <Button
      v-else
      variant="outline"
      class="w-full h-12 text-sm border-2 border-primary/50 hover:border-primary hover:bg-primary/5 font-bold"
      @click="handleEditProduct"
    >
      {{ productButtonText }}
    </Button>

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
    <ProductSelectModal
      ref="productModalRef"
      :currency="currency"
      :products="selectorProducts"
      :title="productModalTitle"
      :description="productModalDescription"
      :no-products-message="productNoProductsMessage"
      @select="handleProductSelect"
    />

    <TributeModal
      ref="tributeModalRef"
      :config="formConfig.features.tribute"
      @save="handleTributeSave"
    />
  </div>
</template>
