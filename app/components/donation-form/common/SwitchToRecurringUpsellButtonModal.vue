<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import ProductCard from '~/components/donation-form/cart/ProductCard.vue'
import type { Product } from '@/lib/common/types'

interface Props {
    currentFrequency: 'once' | 'monthly' | 'yearly'
    recurringFrequency?: 'monthly' | 'yearly'
    products: Product[]
    currency?: string
}

interface Emits {
    (e: 'switchToTab', tab: 'monthly' | 'yearly'): void
    (e: 'selectProduct', product: Product): void
}

const props = withDefaults(defineProps<Props>(), {
    currency: 'USD',
    recurringFrequency: 'monthly'
})

const emit = defineEmits<Emits>()

const dialogOpen = ref(false)

const isOnceTab = computed(() => props.currentFrequency === 'once')

const buttonText = computed(() => {
    if (isOnceTab.value) {
        const freqLabel = props.recurringFrequency === 'monthly' ? 'Monthly' : 'Yearly'
        return `Adopt an Orangutan (Switch to ${freqLabel})`
    }
    return 'Adopt an Orangutan'
})

// When on a recurring tab, show products for that frequency
// When on once tab, show products for the recurring frequency
const targetFrequency = computed(() => {
    return isOnceTab.value ? props.recurringFrequency : props.currentFrequency
})

const filteredProducts = computed(() => {
    return props.products.filter(p =>
        !p.isBonusItem &&
        p.frequency === targetFrequency.value
    )
})

const handleButtonClick = () => {
    if (isOnceTab.value) {
        // Switch to recurring tab first
        emit('switchToTab', props.recurringFrequency)
    }
    // Open dialog
    dialogOpen.value = true
}

const handleProductSelect = (product: Product) => {
    dialogOpen.value = false
    emit('selectProduct', product)
}
</script>

<template>
    <div>
        <Button variant="outline"
            class="w-full h-12 text-base border-2 border-primary/50 hover:border-primary hover:bg-primary/5"
            @click="handleButtonClick">
            🦧 {{ buttonText }}
        </Button>

        <BaseDialogOrDrawer v-model:open="dialogOpen" :dismissible="true">
            <template #header>
                <h2 class="text-2xl font-semibold">🦧 Adopt an Orangutan</h2>
                <p class="text-sm text-muted-foreground">
                    Choose an orangutan to support with a {{ targetFrequency }} donation
                </p>
            </template>

            <template #content>
                <div class="space-y-2 max-h-96 overflow-y-auto">
                    <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
                        :currency="currency" @click="handleProductSelect(product)" />
                    <div v-if="filteredProducts.length === 0" class="py-12 text-center text-muted-foreground">
                        No {{ targetFrequency }} adoption products available
                    </div>
                </div>
            </template>
        </BaseDialogOrDrawer>
    </div>
</template>
