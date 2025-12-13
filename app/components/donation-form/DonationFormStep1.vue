<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductConfigModal from '@/components/donation-form/ProductConfigModal.vue'
import BonusItemsSection from '@/components/donation-form/BonusItemsSection.vue'
import DonationAmountSelector from '@/components/donation-form/DonationAmountSelector.vue'
import ProductCard from '@/components/donation-form/ProductCard.vue'
import Cart from '@/components/donation-form/Cart.vue'
import type { Product, CartItem } from '@/composables/useCart'

const { getCurrencySymbol, convertPrice } = useCurrency()
const {
    multipleCart,
    selectedBonusItems,
    currentCart,
    cartTotal,
    recurringTotal,
    oneTimeTotal,
    addToCart,
    removeFromCart,
    updateCartItemPrice,
    isInCart,
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

// Constants
const ALLOW_MULTIPLE_ITEMS = true
const INITIAL_PRODUCTS_DISPLAYED = 3

// Settings
const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
]

const baseFrequencies = [
    { value: 'once', label: 'One-time' },
    { value: 'monthly', label: 'Monthly' },
]

const frequencies = computed(() => {
    const freqs = [...baseFrequencies]
    if (ALLOW_MULTIPLE_ITEMS) {
        freqs.push({ value: 'multiple', label: 'Multiple' })
    }
    return freqs
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
        price: 25,
        frequency: 'once',
        image: '🧸',
        thumbnail: '🧸',
        icon: '🧸',
        isBonusItem: true,
        bonusThreshold: {
            once: 50,
            monthly: 25
        }
    },
    {
        id: 'adopt-kit',
        name: 'Adoption Welcome Kit',
        description: 'Certificate, photo, and updates about your adopted orangutan',
        price: 15,
        frequency: 'once',
        image: '📦',
        thumbnail: '📦',
        icon: '📦',
        isBonusItem: true,
        bonusThreshold: {
            once: 50,
            monthly: 10
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
]

// Amounts in base currency (GBP) - will be converted to selected currency
const amountsInBaseCurrency = {
    once: {
        amounts: [10, 25, 50, 100, 500, 1000],
        minPrice: 5,
        maxPrice: 1000
    },
    monthly: {
        amounts: [10, 25, 50, 75, 100, 300],
        minPrice: 3,
        maxPrice: 500
    },
    yearly: {
        amounts: [50, 100, 250, 500, 1000],
        minPrice: 25,
        maxPrice: 2000
    },
}

// State - Single donation
const selectedCurrency = ref('GBP')
const selectedFrequency = ref('once')
const donationAmounts = ref({
    once: 0,
    monthly: 0,
    yearly: 0
})

// State - Multiple items
const searchQuery = ref('')
const productPrices = ref<Record<string, number>>({})
const cartRef = ref<InstanceType<typeof Cart> | null>(null)
const showAllProducts = ref(false)

// Computed
const currencySymbol = computed(() => getCurrencySymbol(selectedCurrency.value))

const availableAmounts = computed(() => {
    if (selectedFrequency.value === 'multiple') return []
    const config = amountsInBaseCurrency[selectedFrequency.value as keyof typeof amountsInBaseCurrency]
    return config.amounts.map(amount => convertPrice(amount, selectedCurrency.value))
})

const sliderMinPrice = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return Math.min(
            convertPrice(amountsInBaseCurrency.once.minPrice, selectedCurrency.value),
            convertPrice(amountsInBaseCurrency.monthly.minPrice, selectedCurrency.value)
        )
    }
    const config = amountsInBaseCurrency[selectedFrequency.value as keyof typeof amountsInBaseCurrency]
    return convertPrice(config.minPrice, selectedCurrency.value)
})

const sliderMaxPrice = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return Math.max(
            convertPrice(amountsInBaseCurrency.once.maxPrice, selectedCurrency.value),
            convertPrice(amountsInBaseCurrency.monthly.maxPrice, selectedCurrency.value)
        )
    }
    const config = amountsInBaseCurrency[selectedFrequency.value as keyof typeof amountsInBaseCurrency]
    return convertPrice(config.maxPrice, selectedCurrency.value)
})

const drawerAmounts = computed(() => {
    if (!drawerProduct.value) return []
    const freq = drawerProduct.value.frequency
    const config = amountsInBaseCurrency[freq as keyof typeof amountsInBaseCurrency]
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

const isFormValid = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return multipleCart.value.length > 0
    }
    const freqKey = selectedFrequency.value as keyof typeof donationAmounts.value
    return donationAmounts.value[freqKey] > 0
})

// Initialize product prices
products.forEach(product => {
    productPrices.value[product.id] = product.default ?? product.price
})

// Methods - Cart management
const getProductPrice = (productId: string) => {
    return productPrices.value[productId] ?? products.find(p => p.id === productId)?.price ?? 0
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

const handleIsInCart = (productId: string) => {
    return isInCart(productId, 'multiple')
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
</script>

<template>
    <div class="space-y-6">
        <!-- Header with Currency Selector -->
        <div class="flex items-start justify-between gap-2">
            <div>
                <h2 class="text-xl font-semibold">Make a Donation</h2>
                <p class="text-sm text-muted-foreground">Choose your donation amount</p>
            </div>
            <div class="flex items-center gap-2 justify-end">
                <Label for="currency" class="hidden md:inline-block text-sm">Currency</Label>
                <select id="currency" v-model="selectedCurrency"
                    class="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring">
                    <option v-for="currency in currencies" :key="currency.value" :value="currency.value">
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
            }">
                <TabsTrigger v-for="freq in frequencies" :key="freq.value" :value="freq.value" class="text-base">
                    {{ freq.label }}
                </TabsTrigger>
            </TabsList>

            <!-- Single Donation Tabs (Once/Monthly) -->
            <TabsContent v-for="freq in baseFrequencies" :key="freq.value" :value="freq.value" class="mt-2 space-y-4">
                <!-- Donation Amount Selector -->
                <DonationAmountSelector v-model="donationAmounts[freq.value as keyof typeof donationAmounts]"
                    :amounts="availableAmounts" :currency="selectedCurrency" :min-price="sliderMinPrice"
                    :max-price="sliderMaxPrice" :frequency-label="freq.label.toLowerCase() + ' donation'" />

                <!-- Bonus Items Section -->
                <BonusItemsSection :bonus-items="bonusItems" :selected-bonus-items="selectedBonusItems"
                    :recurring-total="freq.value === 'monthly' ? donationAmounts[freq.value as keyof typeof donationAmounts] : 0"
                    :one-time-total="freq.value === 'once' ? donationAmounts[freq.value as keyof typeof donationAmounts] : 0"
                    :currency="selectedCurrency" @toggle="toggleBonusItem" />

                <!-- Next Button -->
                <Button :disabled="!isFormValid" class="w-full h-12 text-base" @click="handleNext">
                    Next
                </Button>
            </TabsContent>

            <!-- Multiple Items Tab -->
            <TabsContent v-if="ALLOW_MULTIPLE_ITEMS" value="multiple" class="mt-2 space-y-4">
                <!-- Cart Component -->
                <Cart ref="cartRef" :items="multipleCart" :currency="selectedCurrency" :total="activeCartTotal"
                    :show-total="true" @edit="openDrawerForEdit" @remove="handleRemoveFromCart" />

                <!-- Bonus Items Section -->
                <BonusItemsSection :bonus-items="bonusItems" :selected-bonus-items="selectedBonusItems"
                    :recurring-total="recurringTotal" :one-time-total="oneTimeTotal" :currency="selectedCurrency"
                    @toggle="toggleBonusItem" />

                <!-- Products Section -->
                <div class="space-y-4">
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-muted-foreground">Add Items to Your Donation</h3>
                        <div class="relative">
                            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">🔍</span>
                            <Input v-model="searchQuery" type="text" placeholder="Search items..." class="h-10 pl-10" />
                        </div>
                    </div>

                    <!-- Products Grid -->
                    <TransitionGroup name="product-list" tag="div" class="space-y-2">
                        <ProductCard v-for="product in displayedProducts" :key="product.id" :product="product"
                            :currency="selectedCurrency" :is-in-cart="handleIsInCart(product.id)"
                            @click="handleOpenDrawerForAdd(product)" />
                    </TransitionGroup>

                    <!-- Show More Button -->
                    <Button v-if="hasMoreProducts" variant="outline" class="w-full" @click="showAllProducts = true">
                        Show {{ filteredProducts.length - INITIAL_PRODUCTS_DISPLAYED }} More Items
                    </Button>

                    <!-- Empty State -->
                    <div v-if="filteredProducts.length === 0" class="py-12 text-center text-muted-foreground">
                        No items found matching "{{ searchQuery }}"
                    </div>
                </div> <!-- Next Button -->
                <Button :disabled="!isFormValid" class="w-full h-12 text-base" @click="handleNext">
                    Next
                </Button>
            </TabsContent>
        </Tabs>

        <!-- Product Configuration Modal (Dialog on desktop, Drawer on mobile) -->
        <ProductConfigModal v-model:open="drawerOpen" :product="drawerProduct" :currency="selectedCurrency"
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
