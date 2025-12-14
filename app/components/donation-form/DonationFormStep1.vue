<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import ProductOptionsModal from '~/components/donation-form/cart/ProductOptionsModal.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import BonusItemsSection from '~/components/donation-form/common/BonusItemsSection.vue'
import AmountSelector from '~/components/donation-form/common/AmountSelector.vue'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import CartProductLine from '~/components/donation-form/cart/CartProductLine.vue'
import Cart from '@/components/donation-form/cart/Cart.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import ProductTributeForm from '~/components/donation-form/cart/ProductTributeForm.vue'
import TributeLine from '~/components/donation-form/cart/TributeLine.vue'
import type { Product, CartItem, TributeData } from '@/lib/common/types'
import { getCartItemKey, parseCartItemKey } from '@/lib/common/cart-utils'
import ProductCard from './cart/ProductCard.vue'

const { convertPrice } = useCurrency()

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
const {
  multipleCart,
  selectedBonusItems,
  currentCart,
  cartTotal,
  recurringTotal,
  oneTimeTotal,
  monthlyTotal,
  yearlyTotal,
  activeRecurringFrequency,
  addToCart,
  removeFromCart,
  updateCartItemPrice,
  updateCartItemQuantity,
  updateCartItemTribute,
  toggleBonusItem
} = useCart()

// Configuration - These will come from API
const config = {
  // Form labels and titles
  formTitle: 'Make a Donation',
  formSubtitle: 'Choose your donation amount',

  // Adoption feature configuration
  adoptionFeature: {
    enabled: true,
    icon: '🦧',
    singularName: 'Orangutan', // e.g., "Orangutan", "Tiger", "Child"
    pluralName: 'Orangutans',
    actionVerb: 'Adopt', // e.g., "Adopt", "Sponsor", "Support"
    actionNoun: 'adoption', // e.g., "adoption", "sponsorship", "support"

    // Button text
    buttonText: '🦧 Adopt an Orangutan',
    buttonTextOnce: '🦧 Adopt an Orangutan (Monthly)', // Text shown on "once" tab

    // Modal text
    modalTitle: '🦧 Adopt an Orangutan',
    modalDescription: 'Choose an orangutan to support with a {frequency} donation', // {frequency} will be replaced
    noProductsMessage: 'No {frequency} adoption products available' // {frequency} will be replaced
  },
  // Bonus items section configuration
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
  // Shipping notice configuration
  shippingNotice: {
    message: '📦 Shipping address on next page'
  },

  // Multiple items tab configuration
  multipleItemsSection: {
    title: 'Add Items to Your Donation',
    searchPlaceholder: 'Search items...',
    showMoreButton: 'Show {count} More Items', // {count} will be replaced
    emptyStateMessage: 'No items found matching "{query}"' // {query} will be replaced
  }
}

// Computed configuration values
const adoptionButtonText = computed(() => config.adoptionFeature.buttonText)
const adoptionButtonTextOnce = computed(() => config.adoptionFeature.buttonTextOnce)
const adoptionModalTitle = computed(() => config.adoptionFeature.modalTitle)
const adoptionModalDescription = computed(() =>
  config.adoptionFeature.modalDescription.replace('{frequency}', selectedFrequency.value)
)
const adoptionNoProductsMessage = computed(() =>
  config.adoptionFeature.noProductsMessage.replace('{frequency}', selectedFrequency.value)
)

const frequencies = computed(() => {
  const freqs = [...BASE_FREQUENCIES] as Array<{ value: string; label: string }>
  if (ALLOW_MULTIPLE_ITEMS) {
    freqs.push({ value: 'multiple', label: 'Multiple' })
  }
  return freqs
})

const enabledFrequencies = computed(() => {
  return BASE_FREQUENCIES.map((f) => f.value)
})

const products: Product[] = [
  {
    id: 'adopt-bumi',
    name: 'Adopt Bumi the Orangutan',
    description: "Monthly sponsorship to support Bumi's care and rehabilitation",
    // price: 50,
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
    // price: 50,
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
    bonusThreshold: {
      once: 50,
      monthly: 25,
      yearly: 200
    }
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
    bonusThreshold: {
      monthly: 10,
      yearly: 75
    }
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
    // price: 25,
    minPrice: 5,
    default: 25,
    frequency: 'monthly',
    image: '📚',
    thumbnail: '📚',
    icon: '📚'
  }
  // {
  //     id: 'adopt-riko',
  //     name: 'Adopt Riko the Orangutan',
  //     description: 'Yearly sponsorship to support Riko\'s rehabilitation journey',
  //     // price: 120,
  //     minPrice: 50,
  //     default: 120,
  //     frequency: 'yearly',
  //     image: '🦧',
  //     thumbnail: '🦧',
  //     icon: '🦧'
  // },
  // {
  //     id: 'adopt-sari',
  //     name: 'Adopt Sari the Orangutan',
  //     description: 'Yearly sponsorship for Sari\'s long-term care',
  //     // price: 120,
  //     minPrice: 50,
  //     default: 120,
  //     frequency: 'yearly',
  //     image: '🦧',
  //     thumbnail: '🦧',
  //     icon: '🦧'
  // },
]

// State - Single donation
const selectedCurrency = ref('GBP')
const selectedFrequency = ref('once')
const donationAmounts = ref({
  once: 0,
  monthly: 0,
  yearly: 0
})
const selectedAdoptions = ref<{
  monthly: Product | null
  yearly: Product | null
}>({
  monthly: null,
  yearly: null
})

// State - Multiple items
const cartRef = ref<InstanceType<typeof Cart> | null>(null)
const productOptionsModalRef = ref<InstanceType<typeof ProductOptionsModal> | null>(null)
const tributeFormRef = ref<InstanceType<typeof ProductTributeForm> | null>(null)
const adoptionDialogOpen = ref(false)
const tributeDialogOpen = ref(false)
const tributeData = ref<{
  once: TributeData | undefined
  monthly: TributeData | undefined
  yearly: TributeData | undefined
}>({
  once: undefined,
  monthly: undefined,
  yearly: undefined
})

// Temporary tribute state for editing (only saved on confirm)
const tempTributeData = ref<TributeData | undefined>(undefined)

const isTributeFormValid = computed(() => {
  if (!tributeFormRef.value) return true
  return tributeFormRef.value.isValid
})

// Computed
const availableAmounts = computed(() => {
  if (selectedFrequency.value === 'multiple') return []
  const config =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return config.amounts.map((amount) => convertPrice(amount, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') {
    return Math.min(
      convertPrice(AMOUNTS_IN_BASE_CURRENCY.once.minPrice, selectedCurrency.value),
      convertPrice(AMOUNTS_IN_BASE_CURRENCY.monthly.minPrice, selectedCurrency.value)
    )
  }
  const config =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return convertPrice(config.minPrice, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
  if (selectedFrequency.value === 'multiple') {
    return Math.max(
      convertPrice(AMOUNTS_IN_BASE_CURRENCY.once.maxPrice, selectedCurrency.value),
      convertPrice(AMOUNTS_IN_BASE_CURRENCY.monthly.maxPrice, selectedCurrency.value)
    )
  }
  const config =
    AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
  return convertPrice(config.maxPrice, selectedCurrency.value)
})

const filteredProducts = computed(() => {
  // Filter out bonus items from the main product list
  let regularProducts = products.filter((p) => !p.isBonusItem)

  // When frequency is locked, only show once items and items matching the locked frequency
  const locked = activeRecurringFrequency.value
  if (locked) {
    regularProducts = regularProducts.filter(
      (p) => p.frequency === 'once' || p.frequency === locked
    )
  }

  return regularProducts
})

const activeCart = computed(() =>
  currentCart(selectedFrequency.value as 'once' | 'monthly' | 'multiple')
)
const activeCartTotal = computed(() =>
  cartTotal(selectedFrequency.value as 'once' | 'monthly' | 'multiple')
)

const bonusItems = computed(() => products.filter((p) => p.isBonusItem))

const adoptionProducts = computed(() => {
  return products.filter((p) => !p.isBonusItem && p.frequency === selectedFrequency.value)
})

const isFormValid = computed(() => {
  if (selectedFrequency.value === 'multiple') {
    return multipleCart.value.length > 0
  }
  const freqKey = selectedFrequency.value as keyof typeof donationAmounts.value
  return donationAmounts.value[freqKey] > 0
})

const typedSelectedFrequency = computed(
  () => selectedFrequency.value as 'once' | 'monthly' | 'multiple'
)

// Methods - Cart management
const getProductPrice = (productId: string) => {
  const product = products.find((p) => p.id === productId)
  return product?.default ?? product?.price ?? 0
}

const handleOpenDrawerForAdd = (product: Product) => {
  productOptionsModalRef.value?.openForAdd(product, getProductPrice(product.id))
}

const handleOpenDrawerForEdit = (item: CartItem, itemKey: string) => {
  productOptionsModalRef.value?.openForEdit(item, itemKey)
}

const handleModalConfirm = (
  product: Product,
  price: number,
  quantity: number,
  mode: 'add' | 'edit',
  itemKey?: string,
  tribute?: TributeData
) => {
  if (mode === 'add') {
    const cartItem = addToCart(product, price, 'multiple', quantity, tribute)
    const newItemKey = getCartItemKey(cartItem.id, cartItem.addedAt)
    if (cartRef.value) {
      cartRef.value.triggerPulse(newItemKey)
    }
  } else if (mode === 'edit' && itemKey) {
    const parsed = parseCartItemKey(itemKey)
    if (parsed) {
      updateCartItemPrice(parsed.itemId, parsed.addedAt, price, 'multiple')
      updateCartItemQuantity(parsed.itemId, parsed.addedAt, quantity, 'multiple')
      if (tribute) {
        updateCartItemTribute(parsed.itemId, parsed.addedAt, tribute, 'multiple')
      }
    }
  }
}

const handleRemoveFromCart = (itemId: string, addedAt: number) => {
  removeFromCart(itemId, addedAt, selectedFrequency.value as 'once' | 'monthly' | 'multiple')
}

const handleNext = () => {
  const freqKey = selectedFrequency.value as keyof typeof donationAmounts.value
  console.log('Proceeding to next step', {
    frequency: selectedFrequency.value,
    amount: donationAmounts.value[freqKey],
    cart: activeCart.value,
    bonusItems: Array.from(selectedBonusItems.value)
  })
}

const handleSwitchToTab = (tab: 'monthly' | 'yearly') => {
  selectedFrequency.value = tab
}

const handleAdoptProductSelect = (product: Product) => {
  // Only monthly and yearly adoptions are supported
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedAdoptions.value[freqKey] = product

  // Only set amount if currently 0 (don't replace existing amounts)
  const currentAmount = donationAmounts.value[freqKey]
  if (currentAmount === 0) {
    const amount = product.default ?? product.price ?? 0
    donationAmounts.value[freqKey] = amount
  }

  adoptionDialogOpen.value = false
}

const handleEditAdoption = () => {
  // If on 'once' tab, switch to monthly first
  if (selectedFrequency.value === 'once') {
    handleSwitchToTab('monthly')
  }
  // Open modal for the current tab's frequency
  adoptionDialogOpen.value = true
}

const handleRemoveAdoption = () => {
  // Only monthly and yearly adoptions are supported
  const freqKey = selectedFrequency.value as 'monthly' | 'yearly'
  selectedAdoptions.value[freqKey] = null
  donationAmounts.value[freqKey] = 0
}

const handleOpenTributeModal = () => {
  const freqKey = selectedFrequency.value as 'once' | 'monthly' | 'yearly'
  // Initialize temp state with current saved data (deep copy)
  tempTributeData.value = tributeData.value[freqKey]
    ? JSON.parse(JSON.stringify(tributeData.value[freqKey]))
    : undefined
  tributeDialogOpen.value = true
}

const handleTributeSave = () => {
  // Save temp data to actual tribute data
  const freqKey = selectedFrequency.value as 'once' | 'monthly' | 'yearly'
  tributeData.value[freqKey] = tempTributeData.value
  tributeDialogOpen.value = false
}

const handleTributeCancel = () => {
  // Discard temp changes
  tempTributeData.value = undefined
  tributeDialogOpen.value = false
}

const handleRemoveTribute = () => {
  const freqKey = selectedFrequency.value as 'once' | 'monthly' | 'yearly'
  tributeData.value[freqKey] = undefined
}

// Watch for tab switches to "multiple" - auto-add selected adoption if cart is empty
watch(selectedFrequency, (newFreq, oldFreq) => {
  if (newFreq === 'multiple' && (oldFreq === 'monthly' || oldFreq === 'yearly')) {
    // Check if multiple cart is empty
    if (multipleCart.value.length === 0) {
      // Check if there's a selected adoption for the previous tab
      const previousAdoption = selectedAdoptions.value[oldFreq]
      if (previousAdoption) {
        const price =
          donationAmounts.value[oldFreq] || previousAdoption.default || previousAdoption.price || 0
        if (price > 0) {
          addToCart(previousAdoption, price, 'multiple')
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
      <div class="flex items-center gap-2 justify-end">
        <!-- <Label for="currency" class="hidden md:inline-block text-sm">Currency</Label> -->
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

      <!-- Single Donation Tabs (Once/Monthly/Yearly) -->
      <TabsContent
        v-for="freq in BASE_FREQUENCIES"
        :key="freq.value"
        :value="freq.value"
        class="mt-2 space-y-4"
      >
        <!-- Donation Amount Selector -->
        <AmountSelector
          v-model="donationAmounts[freq.value as keyof typeof donationAmounts]"
          :amounts="availableAmounts"
          :currency="selectedCurrency"
          :min-price="sliderMinPrice"
          :max-price="sliderMaxPrice"
          :frequency-label="freq.label.toLowerCase() + ' donation'"
          :frequency="freq.value"
        />

        <!-- Adopt an Orangutan - Show selected adoption or button -->
        <CartProductLine
          v-if="selectedAdoptions[freq.value as keyof typeof selectedAdoptions]"
          :item="selectedAdoptions[freq.value as keyof typeof selectedAdoptions]!"
          :currency="selectedCurrency"
          :price="donationAmounts[freq.value as keyof typeof donationAmounts]"
          @edit="handleEditAdoption"
          @remove="handleRemoveAdoption"
        />
        <Button
          v-else
          variant="outline"
          class="w-full h-12 text-sm border-2 border-primary/50 hover:border-primary hover:bg-primary/5 font-bold"
          @click="handleEditAdoption"
        >
          {{ freq.value === 'once' ? adoptionButtonTextOnce : adoptionButtonText }}
        </Button>

        <!-- Gift or In Memory (only for recurring donations) -->
        <TributeLine
          v-if="
            freq.value !== 'once' &&
            tributeData[freq.value as keyof typeof tributeData]?.type !== 'none' &&
            tributeData[freq.value as keyof typeof tributeData]
          "
          :tribute="tributeData[freq.value as keyof typeof tributeData]!"
          @edit="handleOpenTributeModal"
          @remove="handleRemoveTribute"
        />
        <Button
          v-else-if="freq.value !== 'once'"
          variant="outline"
          class="w-full h-10 text-sm"
          @click="handleOpenTributeModal"
        >
          💝 Gift or In Memory of (with eCard)
        </Button>

        <!-- Bonus Items Section -->
        <BonusItemsSection
          :bonus-items="bonusItems"
          :selected-bonus-items="selectedBonusItems"
          :monthly-total="freq.value === 'monthly' ? donationAmounts.monthly : 0"
          :yearly-total="0"
          :one-time-total="freq.value === 'once' ? donationAmounts.once : 0"
          :enabled-frequencies="enabledFrequencies"
          :currency="selectedCurrency"
          :selected-frequency="selectedFrequency"
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
          :selected-frequency="typedSelectedFrequency"
          :products="products"
          :selected-bonus-items="selectedBonusItems"
          :multiple-cart="multipleCart"
          :donation-amounts="donationAmounts"
          :message="config.shippingNotice.message"
        />

        <!-- Next Button -->
        <NextButton :disabled="!isFormValid" @click="handleNext" />
      </TabsContent>

      <!-- Multiple Items Tab -->
      <TabsContent v-if="ALLOW_MULTIPLE_ITEMS" value="multiple" class="mt-2 space-y-4">
        <!-- Cart Component -->
        <Cart
          ref="cartRef"
          :items="multipleCart"
          :currency="selectedCurrency"
          :total="activeCartTotal"
          :recurring-total="recurringTotal"
          :show-total="true"
          :products="filteredProducts"
          :initial-products-displayed="INITIAL_PRODUCTS_DISPLAYED"
          :product-list-config="config.multipleItemsSection"
          @edit="handleOpenDrawerForEdit"
          @remove="handleRemoveFromCart"
          @product-select="handleOpenDrawerForAdd"
        />

        <!-- Bonus Items Section -->
        <BonusItemsSection
          :bonus-items="bonusItems"
          :selected-bonus-items="selectedBonusItems"
          :one-time-total="oneTimeTotal"
          :monthly-total="monthlyTotal"
          :yearly-total="yearlyTotal"
          :enabled-frequencies="enabledFrequencies"
          :currency="selectedCurrency"
          :selected-frequency="selectedFrequency"
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
          :selected-frequency="typedSelectedFrequency"
          :products="products"
          :selected-bonus-items="selectedBonusItems"
          :multiple-cart="multipleCart"
          :donation-amounts="donationAmounts"
          :message="config.shippingNotice.message"
        />

        <!-- Next Button -->
        <NextButton :disabled="!isFormValid" @click="handleNext" />
      </TabsContent>
    </Tabs>

    <!-- Adoption Selection Modal (outside tabs, controlled by adoptionDialogOpen) -->
    <BaseDialogOrDrawer v-model:open="adoptionDialogOpen" :dismissible="true">
      <template #header>
        <h2 class="text-2xl font-semibold">{{ adoptionModalTitle }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ adoptionModalDescription }}
        </p>
      </template>
      <template #content>
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <ProductCard
            v-for="product in adoptionProducts"
            :key="product.id"
            :product="product"
            :currency="selectedCurrency"
            @click="handleAdoptProductSelect(product)"
          />
          <div v-if="adoptionProducts.length === 0" class="py-12 text-center text-muted-foreground">
            {{ adoptionNoProductsMessage }}
          </div>
        </div>
      </template>
    </BaseDialogOrDrawer>

    <!-- Tribute Form Modal (Gift or In Memory) -->
    <BaseDialogOrDrawer v-model:open="tributeDialogOpen" :dismissible="true">
      <template #header>
        <h2 class="text-2xl font-semibold">Gift or In Memory</h2>
        <p class="text-sm text-muted-foreground">
          Make this donation in honor or memory of someone special
        </p>
      </template>
      <template #content>
        <ProductTributeForm
          ref="tributeFormRef"
          v-model="tempTributeData"
          @submit="handleTributeSave"
        />
      </template>
      <template #footer>
        <Button
          class="flex-1 md:flex-1 h-12"
          :disabled="!isTributeFormValid"
          @click="handleTributeSave"
        >
          Save
        </Button>
        <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleTributeCancel">
          Cancel
        </Button>
      </template>
    </BaseDialogOrDrawer>

    <!-- Product Configuration Modal (Dialog on desktop, Drawer on mobile) -->
    <ProductOptionsModal
      ref="productOptionsModalRef"
      :currency="selectedCurrency"
      :amounts-config="AMOUNTS_IN_BASE_CURRENCY"
      @confirm="handleModalConfirm"
    />
  </div>
</template>

<style scoped>
.product-list-enter-active {
  transition: all 0.4s ease-out;
}

.product-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.product-list-move {
  transition: transform 0.4s ease;
}
</style>
