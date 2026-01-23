<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import AmountSelector from '~/features/donation-form/donor/components/AmountSelector.vue'
import NextButton from '~/features/donation-form/donor/components/NextButton.vue'
import ImpactJourneyCard from '~/features/donation-form/features/impact-journey/donor/components/ImpactJourneyCard.vue'
import ShippingNotice from '~/features/donation-form/features/shipping-notice/donor/components/ShippingNotice.vue'
import TributeCard from '~/features/donation-form/features/tribute/donor/components/TributeCard.vue'
import TributeModal from '~/features/donation-form/features/tribute/donor/components/TributeModal.vue'
import ProductSelectorButton from '~/features/donation-form/features/product-selector/donor/components/ProductSelectorButton.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeData } from '~/features/donation-form/features/tribute/shared/types'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'

interface Props {
  frequency: 'once' | 'monthly' | 'yearly'
  frequencyLabel: string
  currency: string
  donationAmount: number
  selectedProduct: Product | null
  tributeData: TributeData | undefined
  products: Product[]
  availableAmounts: number[]
  minPrice: number
  maxPrice: number
  enabledFrequencies: Array<'once' | 'monthly' | 'yearly'>
  formConfig: FullFormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:donationAmount': [value: number]
  'product-select': [product: Product]
  'remove-product': []
  'tribute-save': [tributeData: TributeData | undefined]
  'remove-tribute': []
  next: []
  'switch-to-tab': [tab: 'monthly' | 'yearly', openModal?: boolean, amount?: number]
}>()

// Refs
const productSelectorRef = ref<InstanceType<typeof ProductSelectorButton> | null>(null)
const tributeModalRef = ref<InstanceType<typeof TributeModal> | null>(null)
const formContainerRef = ref<HTMLElement | null>(null)

// Computed
const showTributeSection = computed(() => props.frequency !== 'once')

const hasTribute = computed(
  () => props.tributeData?.type !== 'none' && props.tributeData !== undefined
)

const isFormValid = computed(() => props.donationAmount > 0)

// Methods
const handleAmountUpdate = (value: number) => {
  emit('update:donationAmount', value)
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly', amount?: number) => {
  emit('switch-to-tab', tab, false, amount)
}

const handleUpdateAmount = (amount: number) => {
  // Parent component should handle finding next higher preset amount
  emit('update:donationAmount', amount)
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
  <div ref="formContainerRef" class="space-y-4">
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
      :base-currency="formConfig.pricing.baseCurrency"
      :price="donationAmount"
      :selected-product="selectedProduct"
      :products="products"
      :selector-config="formConfig.features.productSelector"
      :tribute-config="formConfig.features.tribute"
      @product-select="emit('product-select', $event)"
      @remove-product="emit('remove-product')"
      @switch-to-tab="(tab, openModal) => emit('switch-to-tab', tab, openModal)"
    />

    <!-- Gift or In Memory (only for recurring donations) -->
    <template v-if="formConfig.features.tribute.enabled && showTributeSection">
      <TributeCard
        v-if="hasTribute"
        :tribute="tributeData!"
        :config="formConfig.features.tribute"
        @edit="handleOpenTributeModal"
        @remove="emit('remove-tribute')"
      />
      <Button v-else variant="outline" class="w-full h-10 text-sm" @click="handleOpenTributeModal">
        💝 Gift or In Memory of (with eCard)
      </Button>
    </template>

    <!-- Impact Journey -->
    <ImpactJourneyCard
      v-if="formConfig.features.impactJourney.enabled"
      :frequency="frequency"
      :donation-amount="donationAmount"
      :currency="currency"
      :base-currency="formConfig.pricing.baseCurrency"
      :config="formConfig.features.impactJourney"
      :pricing-config="formConfig.pricing"
      :enabled-frequencies="enabledFrequencies"
      @switch-to-tab="handleSwitchToTab"
      @update-amount="handleUpdateAmount"
    />

    <!-- Shipping Notice -->
    <ShippingNotice :requires-shipping="false" />

    <!-- Next Button -->
    <NextButton
      :disabled="!isFormValid"
      :parent-container-ref="formContainerRef"
      @click="emit('next')"
    />

    <!-- Modals -->
    <TributeModal
      ref="tributeModalRef"
      :config="formConfig.features.tribute"
      @save="handleTributeSave"
    />
  </div>
</template>
