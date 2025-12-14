<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DonationFormSingle from './DonationFormSingle.vue'
import DonationFormMultiple from './DonationFormMultiple.vue'
import type { Product, TributeData } from '@/lib/common/types'

const { convertPrice } = useCurrency()
const { multipleCart, addToCart } = useCart()

// Currency configuration - will come from API
const CURRENCIES = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' }
] as const

// Frequency configuration - will come from API
const BASE_FREQUENCIES = [
  { value: 'once', label: 'One-time' },
  { value: 'monthly', label: 'Monthly' }
  // { value: 'yearly', label: 'Yearly' }
] as const

// Amounts in base currency (GBP) - will be converted to selected currency - will come from API
const AMOUNTS_IN_BASE_CURRENCY = {
  once: {
    amounts: [10, 25, 50, 100, 250, 500],
    minPrice: 5,
    maxPrice: 1000
  },
  monthly: {
    amounts: [5, 10, 25, 50, 75, 100],
    minPrice: 3,
    maxPrice: 500
  },
  yearly: {
    amounts: [50, 100, 250, 500, 1000],
    minPrice: 25,
    maxPrice: 2000
  }
} as const

// Feature flags - will come from API
const ALLOW_MULTIPLE_ITEMS = true
const INITIAL_PRODUCTS_DISPLAYED = 3

// Configuration - These will come from API
const config = {
  formTitle: 'Make a Donation',
  formSubtitle: 'Choose your donation amount',
  adoptionFeature: {
    enabled: true,
    icon: '🦧',
    singularName: 'Orangutan',
    pluralName: 'Orangutans',
    actionVerb: 'Adopt',
    actionNoun: 'adoption',
    buttonText: '🦧 Adopt an Orangutan',
    buttonTextOnce: '🦧 Adopt an Orangutan (Monthly)',
    modalTitle: '🦧 Adopt an Orangutan',
    modalDescription: 'Choose an orangutan to support with a {frequency} donation',
    noProductsMessage: 'No {frequency} adoption products available'
  },
  bonusItemsSection: {
    freeGiftsLabel: '🎁 Free gifts available:',
    freeWithDonationLabel: 'FREE with your donation!',
    oneTimeLabel: 'one-time',
    monthlyLabel: 'monthly',
    yearlyLabel: 'yearly',
    addToUnlockSingleTemplate: 'Add {amount} {frequency} to unlock!',
    addToUnlockPairTemplate: 'Add {a} or {b} to unlock!',
    addToUnlockListTemplate: 'Add {list}, or {last} to unlock!',
    switchToTemplate: 'Switch to {frequency}'
  },
  shippingNotice: {
    message: '📦 Shipping address on next page'
  },
  multipleItemsSection: {
    title: 'Add Items to Your Donation',
    searchPlaceholder: 'Search items...',
    showMoreButton: 'Show {count} More Items',
    emptyStateMessage: 'No items found matching "{query}"'
  }
}

const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi the Orangutan',
    description: "Monthly sponsorship to support Bumi's care and rehabilitation",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '🦧',
    thumbnail: '🦧',
    icon: '🦧'
  },
  {
    id: 'adopt-maya',
    name: 'Adopt Maya the Orangutan',
    description: "Monthly sponsorship for Maya's ongoing medical care",
    minPrice: 3,
    default: 10,
    frequency: 'monthly',
    image: '🦧',
    thumbnail: '🦧',
    icon: '🦧'
  },
  {
    id: 'plush-toy',
    name: 'Plush Baby Orangutan Toy',
    description: 'Adorable plush toy to support our mission',
    frequency: 'once',
    image: '🧸',
    thumbnail: '🧸',
    icon: '🧸',
    isBonusItem: true,
    isShippingRequired: true,
    bonusThreshold: { once: 50, monthly: 25, yearly: 200 }
  },
  {
    id: 'adopt-kit',
    name: 'Adoption Welcome Kit',
    description: 'Certificate, photo, and updates about your adopted orangutan',
    frequency: 'once',
    image: '📦',
    thumbnail: '📦',
    icon: '📦',
    isBonusItem: true,
    isShippingRequired: true,
    bonusThreshold: { monthly: 10, yearly: 75 }
  },
  {
    id: 'tree-planting',
    name: 'Plant 10 Trees',
    description: 'Help restore orangutan habitat with native tree planting',
    price: 30,
    frequency: 'once',
    image: '🌳',
    thumbnail: '🌳',
    icon: '🌳'
  },
  {
    id: 'education-program',
    name: 'Support Education Program',
    description: 'Monthly contribution to local conservation education',
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: '📚',
    thumbnail: '📚',
    icon: '📚'
  }
]

// State
const selectedCurrency = ref('GBP')
const selectedFrequency = ref('once')
const donationAmounts = ref({ once: 0, monthly: 0, yearly: 0 })
const selectedAdoptions = ref<{ monthly: Product | null; yearly: Product | null }>({
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
  const freqs = [...BASE_FREQUENCIES] as Array<{ value: string; label: string }>
  if (ALLOW_MULTIPLE_ITEMS) freqs.push({ value: 'multiple', label: 'Multiple' })
  return freqs
})

const enabledFrequencies = computed(
  () => BASE_FREQUENCIES.map((f) => f.value) as Array<'once' | 'monthly' | 'yearly'>
)

const availableAmounts = computed(() => {
  if (selectedFrequency.value === 'multiple') return []
  const cfg =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return cfg.amounts.map((amt) => convertPrice(amt, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return convertPrice(cfg.minPrice, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') return 0
  const cfg =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return convertPrice(cfg.maxPrice, selectedCurrency.value)
})

const bonusItems = computed(() => products.filter((p) => p.isBonusItem))

// Helper to cast frequency type safely
const castFrequency = (freq: string): 'once' | 'monthly' | 'yearly' => {
  return freq as 'once' | 'monthly' | 'yearly'
}

// Methods
const handleNext = () => {
  console.log('Proceeding to next step', {
    frequency: selectedFrequency.value,
    donationAmounts: donationAmounts.value,
    selectedAdoptions: selectedAdoptions.value,
    multipleCart: multipleCart.value
  })
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly', openModal?: boolean) => {
  selectedFrequency.value = tab
  if (openModal) {
    // Wait for next tick to ensure the new tab component is rendered
    setTimeout(() => {
      const formRef = singleFormRefs.get(tab)
      formRef?.openAdoptionModal()
    }, 100)
  }
}

const handleRemoveAdoption = () => {
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedAdoptions.value[freqKey] = null
  donationAmounts.value[freqKey] = 0
}

const handleAdoptionSelect = (product: Product) => {
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedAdoptions.value[freqKey] = product
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

// Watch for tab switches to "multiple" - auto-add selected adoption if cart is empty
watch(selectedFrequency, (newFreq, oldFreq) => {
  if (newFreq === 'multiple' && (oldFreq === 'monthly' || oldFreq === 'yearly')) {
    if (multipleCart.value.length === 0) {
      const previousAdoption = selectedAdoptions.value[oldFreq]
      if (previousAdoption) {
        const price =
          donationAmounts.value[oldFreq] || previousAdoption.default || previousAdoption.price || 0
        if (price > 0) {
          addToCart(previousAdoption, price, 'multiple', undefined, tributeData.value[oldFreq])
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
        <h2 class="text-xl font-semibold">{{ config.formTitle }}</h2>
        <p class="text-sm text-muted-foreground">{{ config.formSubtitle }}</p>
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
          :selected-adoption="
            selectedAdoptions[freq.value as keyof typeof selectedAdoptions] ?? null
          "
          :tribute-data="tributeData[freq.value as keyof typeof tributeData]"
          :bonus-items="bonusItems"
          :products="products"
          :available-amounts="availableAmounts"
          :min-price="sliderMinPrice"
          :max-price="sliderMaxPrice"
          :enabled-frequencies="enabledFrequencies"
          :config="config"
          @update:donation-amount="
            (val) => (donationAmounts[freq.value as keyof typeof donationAmounts] = val)
          "
          @adoption-select="handleAdoptionSelect"
          @remove-adoption="handleRemoveAdoption"
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
          :bonus-items="bonusItems"
          :products="products"
          :enabled-frequencies="enabledFrequencies"
          :initial-products-displayed="INITIAL_PRODUCTS_DISPLAYED"
          :amounts-config="AMOUNTS_IN_BASE_CURRENCY"
          :config="config"
          @next="handleNext"
          @switch-to-tab="handleSwitchToTab"
        />
      </TabsContent>
    </Tabs>
  </div>
</template>
