<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductOptionsModal from '~/components/donation-form/cart/ProductOptionsModal.vue'
import NextButton from '~/components/donation-form/common/NextButton.vue'
import BonusItemsSection from '~/components/donation-form/common/BonusItemsSection.vue'
import DonationAmountSelector from '~/components/donation-form/common/DonationAmountSelector.vue'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import CartProductLine from '~/components/donation-form/cart/CartProductLine.vue'
import ProductCard from '~/components/donation-form/cart/ProductCard.vue'
import Cart from '@/components/donation-form/cart/Cart.vue'
import ShippingNotice from '~/components/donation-form/common/ShippingNotice.vue'
import type { Product } from '@/lib/common/types'
import { CURRENCIES, BASE_FREQUENCIES, AMOUNTS_IN_BASE_CURRENCY, ALLOW_MULTIPLE_ITEMS, INITIAL_PRODUCTS_DISPLAYED } from '@/lib/common/constants'

const { getCurrencySymbol, convertPrice } = useCurrency()
const {
    multipleCart,
    selectedBonusItems,
    currentCart,
    cartTotal,
    recurringTotal,
    oneTimeTotal,
    monthlyTotal,
    yearlyTotal,
    addToCart,
    removeFromCart,
    updateCartItemPrice,
    toggleBonusItem,
} = useCart()
const {
    drawerOpen,
    drawerProduct,
    drawerMode,
    drawerInitialPrice,
    openDrawerForAdd,
    openDrawerForEdit,
    handleDrawerConfirm,
} = useProductConfig()

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
        noProductsMessage: 'No {frequency} adoption products available', // {frequency} will be replaced
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
        switchToTemplate: 'Switch to {frequency}',
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
        emptyStateMessage: 'No items found matching "{query}"', // {query} will be replaced
    },
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
    return BASE_FREQUENCIES.map(f => f.value) as Array<'once' | 'monthly' | 'yearly'>
})

// Get the first enabled recurring frequency (monthly or yearly)
const firstRecurringFrequency = computed<'monthly' | 'yearly'>(() => {
    const recurring = enabledFrequencies.value.filter(f => f !== 'once')
    return (recurring[0] || 'monthly') as 'monthly' | 'yearly'
})

const products: Product[] = [
    {
        id: 'adopt-bumi',
        name: 'Adopt Bumi the Orangutan',
        description: 'Monthly sponsorship to support Bumi\'s care and rehabilitation',
        price: 50,
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
        description: 'Monthly sponsorship for Maya\'s ongoing medical care',
        price: 50,
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
        price: 25,
        minPrice: 5,
        default: 25,
        frequency: 'monthly',
        image: '📚',
        thumbnail: '📚',
        icon: '📚'
    },
    {
        id: 'adopt-riko',
        name: 'Adopt Riko the Orangutan',
        description: 'Yearly sponsorship to support Riko\'s rehabilitation journey',
        price: 120,
        minPrice: 50,
        default: 120,
        frequency: 'yearly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
    },
    {
        id: 'adopt-sari',
        name: 'Adopt Sari the Orangutan',
        description: 'Yearly sponsorship for Sari\'s long-term care',
        price: 120,
        minPrice: 50,
        default: 120,
        frequency: 'yearly',
        image: '🦧',
        thumbnail: '🦧',
        icon: '🦧'
    },
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
const searchQuery = ref('')
const cartRef = ref<InstanceType<typeof Cart> | null>(null)
const showAllProducts = ref(false)
const adoptionDialogOpen = ref(false)

// Computed
const currencySymbol = computed(() => getCurrencySymbol(selectedCurrency.value))

const availableAmounts = computed(() => {
    if (selectedFrequency.value === 'multiple') return []
    const config = AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
    return config.amounts.map(amount => convertPrice(amount, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return Math.min(
            convertPrice(AMOUNTS_IN_BASE_CURRENCY.once.minPrice, selectedCurrency.value),
            convertPrice(AMOUNTS_IN_BASE_CURRENCY.monthly.minPrice, selectedCurrency.value)
        )
    }
    const config = AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
    return convertPrice(config.minPrice, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return Math.max(
            convertPrice(AMOUNTS_IN_BASE_CURRENCY.once.maxPrice, selectedCurrency.value),
            convertPrice(AMOUNTS_IN_BASE_CURRENCY.monthly.maxPrice, selectedCurrency.value)
        )
    }
    const config = AMOUNTS_IN_BASE_CURRENCY[selectedFrequency.value as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
    return convertPrice(config.maxPrice, selectedCurrency.value)
})

const drawerAmounts = computed(() => {
    if (!drawerProduct.value) return []
    const freq = drawerProduct.value.frequency
    const config = AMOUNTS_IN_BASE_CURRENCY[freq as keyof typeof AMOUNTS_IN_BASE_CURRENCY]
    if (!config) return []
    return config.amounts.map(amount => convertPrice(amount, selectedCurrency.value))
})

const filteredProducts = computed(() => {
    // Filter out bonus items from the main product list
    const regularProducts = products.filter(p => !p.isBonusItem)
    if (!searchQuery.value.trim()) return regularProducts
    const query = searchQuery.value.toLowerCase()
    return regularProducts.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    )
})

const displayedProducts = computed(() => {
    if (showAllProducts.value || searchQuery.value.trim()) {
        return filteredProducts.value
    }
    return filteredProducts.value.slice(0, INITIAL_PRODUCTS_DISPLAYED)
})

const hasMoreProducts = computed(() => {
    return !showAllProducts.value &&
        !searchQuery.value.trim() &&
        filteredProducts.value.length > INITIAL_PRODUCTS_DISPLAYED
})

const activeCart = computed(() => currentCart(selectedFrequency.value as 'once' | 'monthly' | 'multiple'))
const activeCartTotal = computed(() => cartTotal(selectedFrequency.value as 'once' | 'monthly' | 'multiple'))

const bonusItems = computed(() => products.filter(p => p.isBonusItem))

const adoptionProducts = computed(() => {
    return products.filter(p =>
        !p.isBonusItem &&
        p.frequency === selectedFrequency.value
    )
})

const isFormValid = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return multipleCart.value.length > 0
    }
    const freqKey = selectedFrequency.value as keyof typeof donationAmounts.value
    return donationAmounts.value[freqKey] > 0
})

// Methods - Cart management
const getProductPrice = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.default ?? product?.price ?? 0
}

const handleOpenDrawerForAdd = (product: Product) => {
    openDrawerForAdd(product, getProductPrice(product.id))
}

const handleDrawerConfirmWrapper = (price: number) => {
    handleDrawerConfirm(
        price,
        (product, price) => addToCart(product, price, 'multiple'),
        (itemId, addedAt, price) => updateCartItemPrice(itemId, addedAt, price, 'multiple'),
        cartRef
    )
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
                <select id="currency" v-model="selectedCurrency"
                    class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
                    <option v-for="currency in CURRENCIES" :key="currency.value" :value="currency.value">
                        {{ currency.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Frequency Tabs -->
        <Tabs v-model="selectedFrequency">
            <TabsList class="grid w-full h-12" :class="{
                'grid-cols-1': frequencies.length === 1,
                'grid-cols-2': frequencies.length === 2,
                'grid-cols-3': frequencies.length === 3,
                'grid-cols-4': frequencies.length === 4,
            }">
                <TabsTrigger v-for="freq in frequencies" :key="freq.value" :value="freq.value" :class="[
                    frequencies.length === 4 ? 'text-sm font-bold' : 'text-base',
                    'data-[state=active]:bg-primary! data-[state=active]:text-primary-foreground!'
                ]">
                    {{ freq.label }}
                </TabsTrigger>
            </TabsList>

            <!-- Single Donation Tabs (Once/Monthly/Yearly) -->
            <TabsContent v-for="freq in BASE_FREQUENCIES" :key="freq.value" :value="freq.value" class="mt-2 space-y-4">
                <!-- Donation Amount Selector -->
                <DonationAmountSelector v-model="donationAmounts[freq.value as keyof typeof donationAmounts]"
                    :amounts="availableAmounts" :currency="selectedCurrency" :min-price="sliderMinPrice"
                    :max-price="sliderMaxPrice" :frequency-label="freq.label.toLowerCase() + ' donation'" />

                <!-- Adopt an Orangutan - Show selected adoption or button -->
                <CartProductLine v-if="selectedAdoptions[freq.value as keyof typeof selectedAdoptions]"
                    :item="selectedAdoptions[freq.value as keyof typeof selectedAdoptions]!"
                    :currency="selectedCurrency" :price="donationAmounts[freq.value as keyof typeof donationAmounts]"
                    @edit="handleEditAdoption" @remove="handleRemoveAdoption" />
                <Button v-else variant="outline"
                    class="w-full h-12 text-sm border-2 border-primary/50 hover:border-primary hover:bg-primary/5 font-bold"
                    @click="handleEditAdoption">
                    {{ freq.value === 'once' ? adoptionButtonTextOnce : adoptionButtonText }}
                </Button>

                <!-- Bonus Items Section -->
                <BonusItemsSection :bonus-items="bonusItems" :selected-bonus-items="selectedBonusItems"
                    :monthly-total="freq.value === 'monthly' ? donationAmounts[freq.value as keyof typeof donationAmounts] : 0"
                    :yearly-total="freq.value === 'yearly' ? donationAmounts[freq.value as keyof typeof donationAmounts] : 0"
                    :one-time-total="freq.value === 'once' ? donationAmounts[freq.value as keyof typeof donationAmounts] : 0"
                    :enabled-frequencies="enabledFrequencies" :currency="selectedCurrency"
                    :selected-frequency="selectedFrequency" @toggle="toggleBonusItem" @switch-to-tab="handleSwitchToTab"
                    :free-gifts-label="config.bonusItemsSection.freeGiftsLabel"
                    :free-with-donation-label="config.bonusItemsSection.freeWithDonationLabel"
                    :one-time-label="config.bonusItemsSection.oneTimeLabel"
                    :monthly-label="config.bonusItemsSection.monthlyLabel"
                    :yearly-label="config.bonusItemsSection.yearlyLabel"
                    :add-to-unlock-single-template="config.bonusItemsSection.addToUnlockSingleTemplate"
                    :add-to-unlock-pair-template="config.bonusItemsSection.addToUnlockPairTemplate"
                    :add-to-unlock-list-template="config.bonusItemsSection.addToUnlockListTemplate"
                    :switch-to-template="config.bonusItemsSection.switchToTemplate" />

                <!-- Shipping Notice -->
                <ShippingNotice :selected-frequency="selectedFrequency as 'once' | 'monthly' | 'multiple'"
                    :products="products" :selected-bonus-items="selectedBonusItems" :multiple-cart="multipleCart"
                    :donation-amounts="donationAmounts" :message="config.shippingNotice.message" />

                <!-- Next Button -->
                <NextButton :disabled="!isFormValid" @click="handleNext" />
            </TabsContent>

            <!-- Multiple Items Tab -->
            <TabsContent v-if="ALLOW_MULTIPLE_ITEMS" value="multiple" class="mt-2 space-y-4">
                <!-- Cart Component -->
                <Cart ref="cartRef" :items="multipleCart" :currency="selectedCurrency" :total="activeCartTotal"
                    :recurring-total="recurringTotal" :show-total="true" @edit="openDrawerForEdit"
                    @remove="handleRemoveFromCart" />

                <!-- Bonus Items Section -->
                <BonusItemsSection :bonus-items="bonusItems" :selected-bonus-items="selectedBonusItems"
                    :one-time-total="oneTimeTotal" :monthly-total="monthlyTotal" :yearly-total="yearlyTotal"
                    :enabled-frequencies="enabledFrequencies" :currency="selectedCurrency"
                    :selected-frequency="selectedFrequency" @toggle="toggleBonusItem" @switch-to-tab="handleSwitchToTab"
                    :free-gifts-label="config.bonusItemsSection.freeGiftsLabel"
                    :free-with-donation-label="config.bonusItemsSection.freeWithDonationLabel"
                    :one-time-label="config.bonusItemsSection.oneTimeLabel"
                    :monthly-label="config.bonusItemsSection.monthlyLabel"
                    :yearly-label="config.bonusItemsSection.yearlyLabel"
                    :add-to-unlock-single-template="config.bonusItemsSection.addToUnlockSingleTemplate"
                    :add-to-unlock-pair-template="config.bonusItemsSection.addToUnlockPairTemplate"
                    :add-to-unlock-list-template="config.bonusItemsSection.addToUnlockListTemplate"
                    :switch-to-template="config.bonusItemsSection.switchToTemplate" />

                <!-- Shipping Notice -->
                <ShippingNotice :selected-frequency="selectedFrequency as 'once' | 'monthly' | 'multiple'"
                    :products="products" :selected-bonus-items="selectedBonusItems" :multiple-cart="multipleCart"
                    :donation-amounts="donationAmounts" :message="config.shippingNotice.message" />

                <!-- Products Section -->
                <div class="space-y-4">
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-muted-foreground">{{ config.multipleItemsSection.title }}
                        </h3>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
                            <Input v-model="searchQuery" type="text"
                                :placeholder="config.multipleItemsSection.searchPlaceholder" class="h-10 pl-10" />
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <TransitionGroup name="product-list" tag="div" class="space-y-2">
                        <ProductCard v-for="product in displayedProducts" :key="product.id" :product="product"
                            :currency="selectedCurrency" @click="handleOpenDrawerForAdd(product)" />
                    </TransitionGroup>

                    <!-- Show More Button -->
                    <Button v-if="hasMoreProducts" variant="outline" class="w-full" @click="showAllProducts = true">
                        {{ config.multipleItemsSection.showMoreButton.replace('{count}', String(filteredProducts.length
                            - INITIAL_PRODUCTS_DISPLAYED)) }}
                    </Button>

                    <!-- Empty State -->
                    <div v-if="filteredProducts.length === 0" class="py-12 text-center text-muted-foreground">
                        {{ config.multipleItemsSection.emptyStateMessage.replace('{query}', searchQuery) }}
                    </div>
                </div>

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
                    <ProductCard v-for="product in adoptionProducts" :key="product.id" :product="product"
                        :currency="selectedCurrency" @click="handleAdoptProductSelect(product)" />
                    <div v-if="adoptionProducts.length === 0" class="py-12 text-center text-muted-foreground">
                        {{ adoptionNoProductsMessage }}
                    </div>
                </div>
            </template>
        </BaseDialogOrDrawer>

        <!-- Product Configuration Modal (Dialog on desktop, Drawer on mobile) -->
        <ProductOptionsModal v-model:open="drawerOpen" :product="drawerProduct" :currency="selectedCurrency"
            :initial-price="drawerInitialPrice" :max-price="sliderMaxPrice" :mode="drawerMode" :amounts="drawerAmounts"
            @confirm="handleDrawerConfirmWrapper" />
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
