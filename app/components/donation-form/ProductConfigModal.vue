<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import ProductConfigDialog from '@/components/donation-form/ProductConfigDialog.vue'
import ProductConfigDrawer from '@/components/donation-form/ProductConfigDrawer.vue'

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

interface Props {
    open?: boolean
    product: Product | null
    currency?: string
    initialPrice?: number
    maxPrice?: number
    mode?: 'add' | 'edit'
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'confirm', price: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Detect if we're on desktop (md breakpoint and above = 768px)
const isDesktop = useMediaQuery('(min-width: 768px)')
</script>

<template>
    <ProductConfigDialog v-if="isDesktop" :open="open" :product="product" :currency="currency"
        :initial-price="initialPrice" :max-price="maxPrice" :mode="mode"
        @update:open="(val) => emit('update:open', val)" @confirm="(price) => emit('confirm', price)" />
    <ProductConfigDrawer v-else :open="open" :product="product" :currency="currency" :initial-price="initialPrice"
        :max-price="maxPrice" :mode="mode" @update:open="(val) => emit('update:open', val)"
        @confirm="(price) => emit('confirm', price)" />
</template>
