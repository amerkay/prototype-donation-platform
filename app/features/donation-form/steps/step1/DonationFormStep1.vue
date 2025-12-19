<script setup lang="ts">
import { computed, watch, inject } from 'vue'
import type { Ref } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrency } from '~/features/donation-form/composables/useCurrency'
import { useDonationFormState } from '~/features/donation-form/composables/useDonationFormState'
import DonationFormSingle from './DonationFormSingle.vue'
import DonationFormMultiple from './DonationFormMultiple.vue'
import type { FormConfig, Product, TributeData } from '@/lib/common/types'
import { formConfig as defaultConfig } from '@/features/donation-form/api-sample-response-form-config'
import { useImpactCart } from '~/features/donation-form/composables/useImpactCart'

// Inject products from parent
const products = inject<Ref<Product[]>>('products')
if (!products) {
  throw new Error('products not provided')
}

interface Props {
  config?: FormConfig
}

const props = defineProps<Props>()

// Use provided config or fall back to default
const formConfig = computed(() => props.config ?? defaultConfig)

const emit = defineEmits<{
  complete: []
}>()

const { convertPrice } = useCurrency(computed(() => formConfig.value.pricing.baseCurrency).value)
const { multipleCart, addToCart } = useImpactCart()

// Use new donation form state composable
const {
  activeTab: selectedFrequency,
  selectedCurrency,
  donationAmounts,
  selectedProducts,
  tributeData,
  selectedRewards,
  toggleReward,
  clearSession
} = useDonationFormState(formConfig.value.localization.defaultCurrency)

// Extract config values - now reactive to config changes
const CURRENCIES = computed(() =>
  formConfig.value.localization.supportedCurrencies.map((c) => ({
    value: c.code,
    label: c.label
  }))
)

// Convert frequencies object to array format for UI
const BASE_FREQUENCIES = computed(() => {
  const freqs = formConfig.value.pricing.frequencies
  return Object.entries(freqs).map(([value, config]) => ({
    value,
    label: config.label
  }))
})

const ALLOW_MULTIPLE_ITEMS = computed(() => formConfig.value.features.impactCart.enabled)
const INITIAL_PRODUCTS_DISPLAYED = computed(
  () => formConfig.value.features.impactCart.initialDisplay
)

// Refs
const singleFormRefs = new Map<string, InstanceType<typeof DonationFormSingle>>()

const setSingleFormRef = (freq: string) => (el: unknown) => {
  if (el && (freq === 'monthly' || freq === 'yearly')) {
    singleFormRefs.set(freq, el as InstanceType<typeof DonationFormSingle>)
  }
}

// Computed
const frequencies = computed(() => {
  const freqs = [...BASE_FREQUENCIES.value] as Array<{ value: string; label: string }>
  if (ALLOW_MULTIPLE_ITEMS.value) {
    freqs.push({ value: 'multiple', label: 'Multiple ✨' })
  }
  return freqs
})

const allFrequencies = computed(
  () => BASE_FREQUENCIES.value.map((f) => f.value) as Array<'once' | 'monthly' | 'yearly'>
)

// Alias for backward compatibility
const enabledFrequencies = allFrequencies

const availableAmounts = computed(() => {
  if (selectedFrequency.value === 'multiple') return []
  const cfg =
    formConfig.value.pricing.frequencies[selectedFrequency.value as 'once' | 'monthly' | 'yearly']
  if (!cfg) return []
  return cfg.presetAmounts.map((amt: number) => convertPrice(amt, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg =
    formConfig.value.pricing.frequencies[selectedFrequency.value as 'once' | 'monthly' | 'yearly']
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.min, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg =
    formConfig.value.pricing.frequencies[selectedFrequency.value as 'once' | 'monthly' | 'yearly']
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.max, selectedCurrency.value)
})

const rewards = computed(() => products.value.filter((p: Product) => p.isReward))

// Helper to cast frequency type safely
const castFrequency = (freq: string): 'once' | 'monthly' | 'yearly' => {
  return freq as 'once' | 'monthly' | 'yearly'
}

// Methods
const handleNext = () => {
  console.log('Proceeding to next step', {
    frequency: selectedFrequency.value,
    donationAmounts: donationAmounts.value,
    selectedProducts: selectedProducts.value,
    multipleCart: multipleCart.value
  })

  // Emit complete event to parent wizard
  emit('complete')

  // TODO: When implementing actual form submission, call clearSession() on success
  // clearSession()
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly', openModal?: boolean) => {
  selectedFrequency.value = tab
  if (openModal) {
    // Wait for next tick to ensure the new tab component is rendered
    setTimeout(() => {
      const formRef = singleFormRefs.get(tab)
      formRef?.openProductModal()
    }, 100)
  }
}

const handleRemoveProduct = () => {
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedProducts.value[freqKey] = null
  donationAmounts.value[freqKey] = 0
}

const handleProductSelect = (product: Product) => {
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedProducts.value[freqKey] = product
  if (donationAmounts.value[freqKey] === 0) {
    donationAmounts.value[freqKey] = product.default ?? product.price ?? 0
  }
}

const handleTributeSave = (data: TributeData | undefined) => {
  const freqKey = selectedFrequency.value as 'once' | 'monthly' | 'yearly'
  tributeData.value[freqKey] = data
}

const handleRemoveTribute = () => {
  const freqKey = selectedFrequency.value as 'once' | 'monthly' | 'yearly'
  tributeData.value[freqKey] = undefined
}

// Expose clearSession for parent components (e.g., after successful form submission)
defineExpose({
  clearSession
})

// Watch for tab switches to "multiple" - auto-add selected product if cart is empty
watch(selectedFrequency, (newFreq, oldFreq) => {
  if (newFreq === 'multiple' && (oldFreq === 'monthly' || oldFreq === 'yearly')) {
    if (multipleCart.value.length === 0) {
      const previousProduct = selectedProducts.value[oldFreq]
      if (previousProduct) {
        const price =
          donationAmounts.value[oldFreq] || previousProduct.default || previousProduct.price || 0
        if (price > 0) {
          addToCart(previousProduct, price, 'multiple', undefined, tributeData.value[oldFreq])
        }
      }
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Currency Selector -->
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="text-xl font-semibold">{{ formConfig.form.title }}</h2>
        <p class="text-sm text-muted-foreground">{{ formConfig.form.subtitle }}</p>
      </div>
      <select
        id="currency"
        v-model="selectedCurrency"
        class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option v-for="currency in CURRENCIES" :key="currency.value" :value="currency.value">
          {{ currency.label }}
        </option>
      </select>
    </div>

    <!-- Frequency Tabs -->
    <Tabs v-model="selectedFrequency">
      <TabsList
        class="grid w-full h-12"
        :class="{
          'grid-cols-1': frequencies.length === 1,
          'grid-cols-2': frequencies.length === 2,
          'grid-cols-3': frequencies.length === 3,
          'grid-cols-4': frequencies.length === 4
        }"
      >
        <TabsTrigger
          v-for="freq in frequencies"
          :key="freq.value"
          :value="freq.value"
          :class="[
            frequencies.length === 4 ? 'text-sm font-bold' : 'text-base',
            'data-[state=active]:bg-secondary! data-[state=active]:text-secondary-foreground!'
          ]"
        >
          {{ freq.label }}
        </TabsTrigger>
      </TabsList>

      <!-- Single Donation Forms (Once/Monthly/Yearly) -->
      <TabsContent
        v-for="freq in BASE_FREQUENCIES"
        :key="freq.value"
        :value="freq.value"
        class="mt-2"
      >
        <DonationFormSingle
          :ref="setSingleFormRef(freq.value)"
          :frequency="castFrequency(freq.value)"
          :frequency-label="freq.label"
          :currency="selectedCurrency"
          :donation-amount="donationAmounts[freq.value as keyof typeof donationAmounts]"
          :selected-product="selectedProducts[freq.value as keyof typeof selectedProducts] ?? null"
          :tribute-data="tributeData[freq.value as keyof typeof tributeData]"
          :selected-rewards="selectedRewards[freq.value as keyof typeof selectedRewards]"
          :rewards="rewards"
          :products="products"
          :available-amounts="availableAmounts"
          :min-price="sliderMinPrice"
          :max-price="sliderMaxPrice"
          :enabled-frequencies="enabledFrequencies"
          :form-config="formConfig"
          @update:donation-amount="
            (val) => (donationAmounts[freq.value as keyof typeof donationAmounts] = val)
          "
          @toggle-reward="(itemId) => toggleReward(itemId, castFrequency(freq.value))"
          @product-select="handleProductSelect"
          @remove-product="handleRemoveProduct"
          @tribute-save="handleTributeSave"
          @remove-tribute="handleRemoveTribute"
          @next="handleNext"
          @switch-to-tab="handleSwitchToTab"
        />
      </TabsContent>

      <!-- Multiple Items Form -->
      <TabsContent v-if="ALLOW_MULTIPLE_ITEMS" value="multiple" class="mt-2">
        <DonationFormMultiple
          ref="multipleFormRef"
          :currency="selectedCurrency"
          :rewards="rewards"
          :products="products"
          :selected-rewards="selectedRewards.multiple"
          :enabled-frequencies="enabledFrequencies"
          :initial-products-displayed="INITIAL_PRODUCTS_DISPLAYED"
          :form-config="formConfig"
          @toggle-reward="(itemId) => toggleReward(itemId, 'multiple')"
          @next="handleNext"
          @switch-to-tab="handleSwitchToTab"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
