<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DonationFormSingle from './DonationFormSingle.vue'
import DonationFormMultiple from './DonationFormMultiple.vue'
import type { TributeData, FormConfig, Product } from '@/lib/common/types'
import { formConfig as defaultConfig } from '@/features/donation-form/api-sample-response-form-config'
import { products } from '@/features/donation-form/api-sample-response-products'
import { useImpactCart } from '~/features/donation-form/cart/useImpactCart'

interface Props {
  config?: FormConfig
}

const props = defineProps<Props>()

// Use provided config or fall back to default
const formConfig = computed(() => props.config ?? defaultConfig)

const { convertPrice } = useCurrency()
const { multipleCart, addToCart } = useImpactCart()

// Extract config values - now reactive to config changes
const CURRENCIES = computed(() =>
  formConfig.value.localization.supportedCurrencies.map((c) => ({
    value: c.code,
    label: c.label
  }))
)
const BASE_FREQUENCIES = computed(() =>
  formConfig.value.pricing.frequencies.map((f) => ({
    value: f.value,
    label: f.label
  }))
)
const ALLOW_MULTIPLE_ITEMS = computed(() => formConfig.value.features.impactCart.enabled)
const INITIAL_PRODUCTS_DISPLAYED = computed(
  () => formConfig.value.features.impactCart.initialDisplay
)

// State
const selectedCurrency = ref(formConfig.value.localization.defaultCurrency)
const selectedFrequency = ref('once')
const donationAmounts = ref({ once: 0, monthly: 0, yearly: 0 })
const selectedProducts = ref<{ monthly: Product | null; yearly: Product | null }>({
  monthly: null,
  yearly: null
})
const tributeData = ref<{
  once: TributeData | undefined
  monthly: TributeData | undefined
  yearly: TributeData | undefined
}>({ once: undefined, monthly: undefined, yearly: undefined })

// Refs
const multipleFormRef = ref<InstanceType<typeof DonationFormMultiple> | null>(null)
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
  const cfg = formConfig.value.pricing.frequencies.find((f) => f.value === selectedFrequency.value)
  if (!cfg) return []
  return cfg.presetAmounts.map((amt) => convertPrice(amt, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg = formConfig.value.pricing.frequencies.find((f) => f.value === selectedFrequency.value)
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.min, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg = formConfig.value.pricing.frequencies.find((f) => f.value === selectedFrequency.value)
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.max, selectedCurrency.value)
})

const rewards = computed(() => products.filter((p) => p.isReward))

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
          :enabled-frequencies="enabledFrequencies"
          :initial-products-displayed="INITIAL_PRODUCTS_DISPLAYED"
          :form-config="formConfig"
          @next="handleNext"
          @switch-to-tab="handleSwitchToTab"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
