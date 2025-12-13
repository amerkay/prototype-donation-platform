<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductConfigModal from '@/components/donation-form/ProductConfigModal.vue'
import BonusItemsSection from '@/components/donation-form/BonusItemsSection.vue'
import DonationAmountSelector from '@/components/donation-form/DonationAmountSelector.vue'

const { getCurrencySymbol, convertPrice } = useCurrency()

// Constants
const ALLOW_MULTIPLE_ITEMS = true
const INITIAL_PRODUCTS_DISPLAYED = 3

interface Product {
    id: string
    name: string
    description: string
    price: number
    minPrice?: number
    default?: number
    frequency: 'once' | 'monthly'
    image: string
    thumbnail: string
    icon: string
    isBonusItem?: boolean
    bonusThreshold?: {
        once: number
        monthly: number
    }
}

interface CartItem extends Product {
    addedAt: number
}

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
const onceCart = ref<CartItem[]>([])
const monthlyCart = ref<CartItem[]>([])
const multipleCart = ref<CartItem[]>([])
const searchQuery = ref('')
const selectedBonusItems = ref<Set<string>>(new Set())
const productPrices = ref<Record<string, number>>({})
const drawerOpen = ref(false)
const drawerProduct = ref<Product | null>(null)
const drawerMode = ref<'add' | 'edit'>('add')
const drawerInitialPrice = ref(0)
const editingItemKey = ref<string | null>(null)
const cartSection = ref<HTMLElement | null>(null)
const pulseNewItem = ref<string | null>(null)
const cartItemRefs = ref<Record<string, HTMLElement>>({})
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

const currentCart = computed(() => {
    if (selectedFrequency.value === 'once') return onceCart.value
    if (selectedFrequency.value === 'monthly') return monthlyCart.value
    return multipleCart.value
})

const cartTotal = computed(() => {
    return currentCart.value.reduce((sum, item) => sum + item.price, 0)
})

const recurringTotal = computed(() => {
    return multipleCart.value
        .filter(item => item.frequency === 'monthly')
        .reduce((sum, item) => sum + item.price, 0)
})

const oneTimeTotal = computed(() => {
    return multipleCart.value
        .filter(item => item.frequency === 'once')
        .reduce((sum, item) => sum + item.price, 0)
})

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

const updateCartItemPrice = (itemId: string, addedAt: number, newPrice: number) => {
    const item = multipleCart.value.find(i => i.id === itemId && i.addedAt === addedAt)
    if (item) {
        item.price = newPrice
    }
}

const getCartItemKey = (itemId: string, addedAt: number) => `${itemId}___${addedAt}`

const openDrawerForAdd = (product: Product) => {
    drawerProduct.value = product
    drawerMode.value = 'add'
    drawerInitialPrice.value = getProductPrice(product.id)
    editingItemKey.value = null
    drawerOpen.value = true
}

const openDrawerForEdit = (item: CartItem, itemKey: string) => {
    drawerProduct.value = item
    drawerMode.value = 'edit'
    drawerInitialPrice.value = item.price
    editingItemKey.value = itemKey
    drawerOpen.value = true
}

const handleDrawerConfirm = (price: number) => {
    if (!drawerProduct.value) return

    if (drawerMode.value === 'add') {
        const cartItem: CartItem = { ...drawerProduct.value, price, addedAt: Date.now() }
        multipleCart.value.push(cartItem)

        const itemKey = getCartItemKey(cartItem.id, cartItem.addedAt)

        // Pulse animation for new item
        pulseNewItem.value = itemKey
        setTimeout(() => {
            pulseNewItem.value = null
        }, 2000)

        // Scroll to the specific new item after animation completes
        setTimeout(() => {
            const itemElement = cartItemRefs.value[itemKey]
            if (itemElement) {
                const elementPosition = itemElement.getBoundingClientRect().top + window.scrollY
                const offsetPosition = elementPosition - 50
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
            } else if (cartSection.value) {
                const elementPosition = cartSection.value.getBoundingClientRect().top + window.scrollY
                const offsetPosition = elementPosition - 50
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
            }
        }, 350)
    } else if (drawerMode.value === 'edit' && editingItemKey.value) {
        const parts = editingItemKey.value.split('___')
        const itemId = parts[0]
        const addedAtStr = parts[1]
        if (itemId && addedAtStr) {
            const addedAt = parseInt(addedAtStr)
            updateCartItemPrice(itemId, addedAt, price)
        }
    }
}

const removeFromCart = (itemId: string, addedAt: number) => {
    const cart = selectedFrequency.value === 'once' ? onceCart :
        selectedFrequency.value === 'monthly' ? monthlyCart : multipleCart
    cart.value = cart.value.filter(item => !(item.id === itemId && item.addedAt === addedAt))
}

const isInCart = (productId: string) => {
    return multipleCart.value.some(item => item.id === productId)
}

const toggleBonusItem = (itemId: string) => {
    if (selectedBonusItems.value.has(itemId)) {
        selectedBonusItems.value.delete(itemId)
    } else {
        selectedBonusItems.value.add(itemId)
    }
}

const handleNext = () => {
    const freqKey = selectedFrequency.value as keyof typeof donationAmounts.value
    console.log('Proceeding to next step', {
        frequency: selectedFrequency.value,
        amount: donationAmounts.value[freqKey],
        cart: currentCart.value,
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
                <!-- Cart Items (if any) -->
                <TransitionGroup v-if="multipleCart.length > 0" ref="cartSection" name="list" tag="div"
                    class="space-y-2 scroll-mt-6">
                    <div v-for="item in multipleCart" :key="`${item.id}-${item.addedAt}`"
                        :ref="(el) => { if (el) cartItemRefs[getCartItemKey(item.id, item.addedAt)] = el as HTMLElement }"
                        class="rounded-lg border bg-card p-3 transition-all" :class="{
                            'pulse-highlight': pulseNewItem === getCartItemKey(item.id, item.addedAt)
                        }">
                        <div class="flex items-center gap-3">
                            <div class="text-2xl">{{ item.thumbnail }}</div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-sm truncate">{{ item.name }}</p>
                                <div class="flex items-center gap-2">
                                    <p class="text-xs text-muted-foreground">
                                        {{ currencySymbol }}{{ item.price }}
                                        <span v-if="item.frequency === 'monthly'">/month</span>
                                    </p>
                                    <button v-if="item.frequency === 'monthly' && item.minPrice"
                                        @click="openDrawerForEdit(item, getCartItemKey(item.id, item.addedAt))"
                                        class="text-xs text-primary hover:underline">
                                        Edit
                                    </button>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" @click="removeFromCart(item.id, item.addedAt)">
                                ✕
                            </Button>
                        </div>
                    </div>
                </TransitionGroup>

                <!-- Cart Total -->
                <div v-if="multipleCart.length > 0" class="space-y-4">
                    <div class="rounded-lg bg-muted p-3 flex items-center justify-between">
                        <span class="text-sm font-medium">Total</span>
                        <span class="text-lg font-bold">{{ currencySymbol }}{{ cartTotal }}</span>
                    </div>
                </div>

                <!-- Bonus Items Section -->
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
                        <button v-for="product in displayedProducts" :key="product.id" type="button"
                            :disabled="isInCart(product.id)" @click="openDrawerForAdd(product)"
                            class="w-full rounded-lg border bg-card p-3 transition-all hover:shadow-sm disabled:cursor-not-allowed text-left">
                            <div class="flex items-center gap-2 sm:gap-3">
                                <div class="text-2xl sm:text-3xl shrink-0">{{ product.image }}</div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-semibold text-sm leading-tight truncate">{{ product.name }}</h3>
                                    <p class="text-xs text-muted-foreground line-clamp-1">{{ product.description }}</p>
                                    <!-- Price display -->
                                    <p class="text-xs font-semibold text-foreground mt-0.5">
                                        <span v-if="product.frequency === 'once'">
                                            {{ currencySymbol }}{{ product.price }} one-time
                                        </span>
                                        <span v-else>
                                            Monthly
                                        </span>
                                    </p>
                                </div>
                                <div class="shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                                    :class="isInCart(product.id) ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400' : 'bg-primary text-primary-foreground'">
                                    <svg v-if="!isInCart(product.id)" xmlns="http://www.w3.org/2000/svg" width="16"
                                        height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                    </svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                </div>
                            </div>
                        </button>

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
            @confirm="handleDrawerConfirm" />
    </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}

.list-enter-from {
    opacity: 0;
    transform: translateY(-10px);
}

.list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

@keyframes pulse-highlight {

    0%,
    100% {
        box-shadow: 0 0 0 0 hsl(var(--primary) / 0);
        border-color: hsl(var(--border));
    }

    50% {
        box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2);
        border-color: hsl(var(--primary));
    }
}

.pulse-highlight {
    animation: pulse-highlight 1.5s ease-in-out 3;
}

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
