<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import ProductConfigDialog from '~/components/donation-form/cart/ProductConfigDialog.vue'
import ProductConfigDrawer from '~/components/donation-form/cart/ProductConfigDrawer.vue'
import type { Product } from '@/lib/common/types'

interface Props {
    open?: boolean
    product: Product | null
    currency?: string
    initialPrice?: number
    maxPrice?: number
    mode?: 'add' | 'edit'
    amounts?: number[]
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
        :initial-price="initialPrice" :max-price="maxPrice" :mode="mode" :amounts="amounts"
        @update:open="(val) => emit('update:open', val)" @confirm="(price) => emit('confirm', price)" />
    <ProductConfigDrawer v-else :open="open" :product="product" :currency="currency" :initial-price="initialPrice"
        :max-price="maxPrice" :mode="mode" :amounts="amounts" @update:open="(val) => emit('update:open', val)"
        @confirm="(price) => emit('confirm', price)" />
</template>
