<script setup lang="ts">
import { ref, computed } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ProductConfigModal from '@/components/donation-form/ProductConfigModal.vue'

// Constants
const ALLOW_MULTIPLE_ITEMS = true
const SLIDER_MAX = 1000
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
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' },
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

const amounts = {
    USD: {
        once: [25, 50, 100, 250, 500, 1000],
        monthly: [10, 25, 50, 100, 200, 300],
        yearly: [100, 250, 500, 1000, 2500],
    },
    EUR: {
        once: [20, 45, 90, 225, 450, 900],
        monthly: [9, 22, 45, 90, 180, 250],
        yearly: [90, 225, 450, 900, 2250],
    },
    GBP: {
        once: [20, 40, 80, 200, 400, 800],
        monthly: [8, 20, 40, 80, 160, 250],
        yearly: [80, 200, 400, 800, 2000],
    },
}

// State - Single donation
const selectedCurrency = ref('USD')
const selectedFrequency = ref('once')
const selectedAmount = ref<number | null>(null)
const customAmount = ref('')
const isCustom = ref(false)

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
const currentCurrency = computed(() =>
    currencies.find(c => c.value === selectedCurrency.value)
)

const availableAmounts = computed(() => {
    if (selectedFrequency.value === 'multiple') return []
    return amounts[selectedCurrency.value as keyof typeof amounts][selectedFrequency.value as keyof typeof amounts.USD]
})

const displayAmount = computed(() => {
    const amount = isCustom.value ? customAmount.value : selectedAmount.value
    return amount ? `${currentCurrency.value?.symbol}${amount}` : ''
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

const eligibleBonusItems = computed(() => {
    return bonusItems.value.filter(item => {
        if (!item.bonusThreshold) return false
        return recurringTotal.value >= item.bonusThreshold.monthly ||
            oneTimeTotal.value >= item.bonusThreshold.once
    })
})

const upsellBonusItems = computed(() => {
    return bonusItems.value.filter(item => {
        if (!item.bonusThreshold) return false
        return recurringTotal.value < item.bonusThreshold.monthly &&
            oneTimeTotal.value < item.bonusThreshold.once
    })
})

const getUpsellMessage = (item: Product) => {
    if (!item.bonusThreshold) return ''
    const recurringNeeded = item.bonusThreshold.monthly - recurringTotal.value
    const oneTimeNeeded = item.bonusThreshold.once - oneTimeTotal.value

    if (recurringNeeded > 0 && oneTimeNeeded > 0) {
        const minNeeded = Math.min(recurringNeeded, oneTimeNeeded)
        return `Add ${currentCurrency.value?.symbol}${minNeeded} more to unlock this free gift!`
    } else if (recurringNeeded > 0) {
        return `Add ${currentCurrency.value?.symbol}${recurringNeeded} in monthly donations to unlock!`
    } else if (oneTimeNeeded > 0) {
        return `Add ${currentCurrency.value?.symbol}${oneTimeNeeded} in one-time donations to unlock!`
    }
    return ''
}

const isFormValid = computed(() => {
    if (selectedFrequency.value === 'multiple') {
        return multipleCart.value.length > 0
    }
    return (selectedAmount.value !== null && selectedAmount.value > 0) ||
        (isCustom.value && customAmount.value && parseFloat(customAmount.value) > 0)
})

// Methods - Single donation
const selectAmount = (amount: number) => {
    selectedAmount.value = amount
    isCustom.value = false
    customAmount.value = ''
}

const enableCustomAmount = () => {
    isCustom.value = true
    selectedAmount.value = null
}

const handleCustomAmountInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value
    customAmount.value = value.replace(/[^0-9.]/g, '')
}

// Initialize product prices
products.forEach(product => {
    productPrices.value[product.id] = product.default ?? product.price
})

// Methods - Cart management
const getProductPrice = (productId: string) => {
    return productPrices.value[productId] ?? products.find(p => p.id === productId)?.price ?? 0
}

const updateProductPrice = (productId: string, price: number) => {
    productPrices.value[productId] = price
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
    console.log('Proceeding to next step', {
        frequency: selectedFrequency.value,
        amount: selectedAmount.value || customAmount.value,
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
            <TabsContent v-for="freq in baseFrequencies" :key="freq.value" :value="freq.value" class="mt-6 space-y-4">
                <!-- Preset Amounts -->
                <div class="grid grid-cols-3 gap-3">
                    <Button v-for="amount in availableAmounts" :key="amount"
                        :variant="selectedAmount === amount && !isCustom ? 'default' : 'outline'"
                        class="h-14 text-lg font-semibold" @click="selectAmount(amount)">
                        {{ currentCurrency?.symbol }}{{ amount }}
                    </Button>
                </div>

                <!-- Custom Amount -->
                <div class="space-y-2">
                    <Button :variant="isCustom ? 'default' : 'outline'" class="h-14 w-full text-lg font-semibold"
                        @click="enableCustomAmount">
                        Custom Amount
                    </Button>

                    <div v-if="isCustom" class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">
                            {{ currentCurrency?.symbol }}
                        </span>
                        <Input v-model="customAmount" type="text" inputmode="decimal" placeholder="0.00"
                            class="h-12 pl-8 text-lg" @input="handleCustomAmountInput" />
                    </div>
                </div>

                <!-- Summary -->
                <div v-if="displayAmount" class="rounded-lg bg-muted p-4 text-center">
                    <p class="text-sm text-muted-foreground">Your {{ freq.label.toLowerCase() }} donation</p>
                    <p class="text-3xl font-bold">{{ displayAmount }}</p>
                </div>

                <!-- Next Button -->
                <Button :disabled="!isFormValid" class="w-full h-12 text-base" @click="handleNext">
                    Next
                </Button>
            </TabsContent>

            <!-- Multiple Items Tab -->
            <TabsContent v-if="ALLOW_MULTIPLE_ITEMS" value="multiple" class="mt-3 space-y-4">
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
                                        {{ currentCurrency?.symbol }}{{ item.price }}
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
                        <span class="text-lg font-bold">{{ currentCurrency?.symbol }}{{ cartTotal }}</span>
                    </div>
                    <div class="border-b"></div>
                </div>

                <!-- Eligible Bonus Items (Free Gifts) -->
                <div v-if="eligibleBonusItems.length > 0" class="space-y-2">
                    <p class="text-sm font-medium text-muted-foreground">🎁 Free gifts available:</p>
                    <div v-for="item in eligibleBonusItems" :key="`bonus-${item.id}`"
                        class="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                        <input type="checkbox" :id="`bonus-${item.id}`" :checked="selectedBonusItems.has(item.id)"
                            @change="toggleBonusItem(item.id)" class="h-4 w-4 rounded border-input" />
                        <label :for="`bonus-${item.id}`" class="flex items-center gap-3 flex-1 cursor-pointer">
                            <div class="text-xl">{{ item.thumbnail }}</div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-sm truncate">{{ item.name }}</p>
                                <p class="text-xs text-success font-medium">FREE with your donation!</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Upsell for Bonus Items -->
                <div v-if="upsellBonusItems.length > 0" class="space-y-2">
                    <div v-for="item in upsellBonusItems" :key="`upsell-${item.id}`"
                        class="rounded-lg border border-dashed bg-card p-3 space-y-2">
                        <div class="flex items-start gap-3">
                            <div class="text-xl opacity-50">{{ item.thumbnail }}</div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-sm text-muted-foreground">{{ item.name }}</p>
                                <p class="text-xs text-primary font-medium">{{ getUpsellMessage(item) }}</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                                            {{ currentCurrency?.symbol }}{{ product.price }} one-time
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
        <ProductConfigModal v-model:open="drawerOpen" :product="drawerProduct" :currency="currentCurrency?.symbol"
            :initial-price="drawerInitialPrice" :max-price="SLIDER_MAX" :mode="drawerMode"
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
