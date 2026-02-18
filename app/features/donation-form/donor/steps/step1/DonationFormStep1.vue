<script setup lang="ts">
import { computed, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CURRENCY_OPTIONS,
  useCurrency
} from '~/features/donation-form/shared/composables/useCurrency'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import DonationFormSingle from './DonationFormSingle.vue'
import DonationFormMultiple from './DonationFormMultiple.vue'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import type { FullFormConfig } from '~/features/donation-form/shared/stores/formConfig'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import { formConfig as defaultConfig } from '~/sample-api-responses/api-sample-response-form-config'

// Get products from store
const configStore = useFormConfigStore()
const products = computed(() => configStore.products)

interface Props {
  config?: FullFormConfig
}

const props = defineProps<Props>()

// Use provided config or fall back to default
const formConfig = computed(() => (props.config ?? defaultConfig) as FullFormConfig)

const emit = defineEmits<{
  complete: []
}>()

const { convertPrice } = useCurrency(
  computed(() => formConfig.value.donationAmounts.baseDefaultCurrency)
)

// Initialize Pinia stores
const store = useDonationFormStore()

// Get effective currencies (form override or global settings)
const { effectiveCurrencies } = useDonationCurrencies()
const currentFormId = computed(() => configStore.formId || 'default')
store.initialize(currentFormId.value, formConfig.value.donationAmounts.baseDefaultCurrency)

const cartStore = useImpactCartStore()
const { isDonation } = useFormTypeLabels()

// Alias for convenience
const selectedFrequency = computed({
  get: () => store.activeTab,
  set: (value) => store.setActiveTab(value)
})
const selectedCurrency = computed({
  get: () => store.selectedCurrency,
  set: (value) => store.setCurrency(value)
})

// Extract config values - now reactive to config changes
const CURRENCIES = computed(() =>
  effectiveCurrencies.value.supportedCurrencies.map((code) => {
    const option = CURRENCY_OPTIONS.find((o) => o.value === code)
    return {
      value: code,
      label: option?.label ?? code
    }
  })
)

const BASE_FREQUENCY_ORDER = ['once', 'monthly', 'yearly'] as const

// Convert frequencies config to array format for UI (enabled only)
const BASE_FREQUENCIES = computed(() => {
  return BASE_FREQUENCY_ORDER.filter(
    (freq) => formConfig.value.donationAmounts.frequencies[freq].enabled
  ).map((freq) => ({
    value: freq,
    label: formConfig.value.donationAmounts.frequencies[freq].label
  }))
})

const ALLOW_MULTIPLE_ITEMS = computed(() => formConfig.value.features.impactCart.enabled)
const INITIAL_PRODUCTS_DISPLAYED = computed(
  () => formConfig.value.features.impactCart.settings?.initialDisplay ?? 3
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

const enabledFrequencies = computed(
  () => BASE_FREQUENCIES.value.map((f) => f.value) as Array<'once' | 'monthly' | 'yearly'>
)

const firstEnabledFrequency = computed(() => enabledFrequencies.value[0] ?? 'once')

watch(
  [enabledFrequencies, selectedFrequency],
  () => {
    if (selectedFrequency.value === 'multiple') return
    if (
      !enabledFrequencies.value.includes(selectedFrequency.value as 'once' | 'monthly' | 'yearly')
    ) {
      selectedFrequency.value = firstEnabledFrequency.value
    }
  },
  { immediate: true }
)

// Get preset amounts in rich format (with descriptions if available)
const richAvailableAmounts = computed(() => {
  if (selectedFrequency.value === 'multiple') return []
  if (
    !enabledFrequencies.value.includes(selectedFrequency.value as 'once' | 'monthly' | 'yearly')
  ) {
    return []
  }
  const cfg =
    formConfig.value.donationAmounts.frequencies[
      selectedFrequency.value as 'once' | 'monthly' | 'yearly'
    ]
  if (!cfg) return []

  // Convert to rich format with currency conversion
  return cfg.presetAmounts.map((preset) => ({
    amount: convertPrice(preset.amount, selectedCurrency.value),
    shortText: preset.shortText,
    image: preset.image
  }))
})

// Check if descriptions are enabled for current frequency
const showAmountDescriptions = computed(() => {
  if (selectedFrequency.value === 'multiple') return false
  if (
    !enabledFrequencies.value.includes(selectedFrequency.value as 'once' | 'monthly' | 'yearly')
  ) {
    return false
  }
  const cfg =
    formConfig.value.donationAmounts.frequencies[
      selectedFrequency.value as 'once' | 'monthly' | 'yearly'
    ]
  return cfg?.enableAmountDescriptions ?? false
})

const sliderMinPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  if (
    !enabledFrequencies.value.includes(selectedFrequency.value as 'once' | 'monthly' | 'yearly')
  ) {
    return 0
  }
  const cfg =
    formConfig.value.donationAmounts.frequencies[
      selectedFrequency.value as 'once' | 'monthly' | 'yearly'
    ]
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.min, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  if (
    !enabledFrequencies.value.includes(selectedFrequency.value as 'once' | 'monthly' | 'yearly')
  ) {
    return 0
  }
  const cfg =
    formConfig.value.donationAmounts.frequencies[
      selectedFrequency.value as 'once' | 'monthly' | 'yearly'
    ]
  if (!cfg) return 0
  return convertPrice(cfg.customAmount.max, selectedCurrency.value)
})

// Helper to cast frequency type safely
const castFrequency = (freq: string): 'once' | 'monthly' | 'yearly' => {
  return freq as 'once' | 'monthly' | 'yearly'
}

// Methods
const handleNext = () => {
  console.log('Proceeding to next step', {
    /* Lines 163-166 omitted */
    multipleCart: cartStore.multipleCart
  })

  // Emit complete event to parent wizard
  emit('complete')

  // TODO: When implementing actual form submission, call store.clearSession() on success
}

const handleSwitchToTab = (
  tab: 'monthly' | 'yearly',
  openModalOrAmount?: boolean | number,
  amount?: number
) => {
  selectedFrequency.value = tab

  // Handle both signatures: (tab, openModal?, amount?) from Single and (tab, amount?) from Multiple
  const openModal = typeof openModalOrAmount === 'boolean' ? openModalOrAmount : false
  const actualAmount = typeof openModalOrAmount === 'number' ? openModalOrAmount : amount

  // Set donation amount if provided (from Impact Journey CTA)
  if (actualAmount !== undefined) {
    const convertedAmount = convertPrice(actualAmount, selectedCurrency.value)
    store.setDonationAmount(tab, convertedAmount)
  }

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
  store.setSelectedProduct(freqKey, null)
  store.setDonationAmount(freqKey, 0)
}

const handleProductSelect = (product: Product) => {
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  store.setSelectedProduct(freqKey, product)
  if (store.donationAmounts[freqKey] === 0) {
    store.setDonationAmount(freqKey, product.default ?? product.price ?? 0)
  }
}

const handleTributeSave = (data: TributeData | undefined) => {
  store.setTributeData(data)
}

const handleRemoveTribute = () => {
  store.setTributeData(undefined)
}

// Expose clearSession for parent components (e.g., after successful form submission)
defineExpose({
  clearSession: () => store.clearSession()
})

// Non-donation forms: force "multiple" tab (cart-based UX)
watch(
  isDonation,
  (donation) => {
    if (!donation) {
      selectedFrequency.value = 'multiple'
    }
  },
  { immediate: true }
)

// Watch for tab switches to "multiple" - auto-add selected product if cart is empty
watch(selectedFrequency, (newFreq, oldFreq) => {
  if (newFreq === 'multiple' && (oldFreq === 'monthly' || oldFreq === 'yearly')) {
    const selectedProduct = store.selectedProducts[oldFreq]
    const amount = store.donationAmounts[oldFreq]
    if (selectedProduct && amount > 0 && cartStore.multipleCart.length === 0) {
      cartStore.addToCart(selectedProduct, amount, 'multiple', 1, store.tributeData)
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header with Currency Selector -->
    <div class="flex items-start justify-between gap-2">
      <div>
        <h2 class="text-xl font-semibold" data-field="formSettings.form.title">
          {{ formConfig.form.title }}
        </h2>
        <p class="text-sm text-muted-foreground" data-field="formSettings.form.subtitle">
          {{ formConfig.form.subtitle }}
        </p>
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

    <!-- Non-donation: Direct cart view (no frequency tabs) -->
    <DonationFormMultiple
      v-if="!isDonation"
      ref="multipleFormRef"
      :currency="selectedCurrency"
      :products="products"
      :enabled-frequencies="enabledFrequencies"
      :initial-products-displayed="INITIAL_PRODUCTS_DISPLAYED"
      :form-config="formConfig"
      @next="handleNext"
      @switch-to-tab="handleSwitchToTab"
    />

    <!-- Donation: Frequency Tabs -->
    <Tabs v-else v-model="selectedFrequency">
      <TabsList
        class="grid w-full h-12"
        :class="{
          'grid-cols-1': frequencies.length === 1,
          'grid-cols-2': frequencies.length === 2,
          'grid-cols-3': frequencies.length === 3,
          'grid-cols-4': frequencies.length === 4
        }"
        data-field="donationAmounts.frequencies"
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
          :donation-amount="store.donationAmounts[freq.value as keyof typeof store.donationAmounts]"
          :selected-product="
            store.selectedProducts[freq.value as keyof typeof store.selectedProducts] ?? null
          "
          :tribute-data="store.tributeData"
          :products="products"
          :available-amounts="richAvailableAmounts"
          :min-price="sliderMinPrice"
          :max-price="sliderMaxPrice"
          :enabled-frequencies="enabledFrequencies"
          :form-config="formConfig"
          :show-amount-descriptions="showAmountDescriptions"
          @update:donation-amount="
            (val) => store.setDonationAmount(freq.value as 'once' | 'monthly' | 'yearly', val)
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
