<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ProductConfigForm from '~/components/donation-form/cart/ProductConfigForm.vue'
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

const props = withDefaults(defineProps<Props>(), {
    open: false,
    currency: 'USD',
    initialPrice: 0,
    maxPrice: 1000,
    mode: 'add',
    amounts: () => []
})

const emit = defineEmits<Emits>()

const localPrice = ref(props.initialPrice)

// Watch for changes to initialPrice to reset local state when modal reopens
watch(() => props.initialPrice, (newPrice) => {
    localPrice.value = newPrice
}, { immediate: true })

const displayPrice = computed(() => {
    return localPrice.value
})

const handleClose = (open: boolean) => {
    emit('update:open', open)
}

const handlePriceUpdate = (price: number) => {
    localPrice.value = price
}

const handleConfirm = () => {
    emit('confirm', displayPrice.value)
    emit('update:open', false)
}
</script>

<template>
    <Dialog :open="open" @update:open="handleClose">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-4xl">{{ product?.thumbnail }}</div>
                    <div class="flex-1 min-w-0 text-left">
                        <DialogTitle>{{ product?.name }}</DialogTitle>
                        <DialogDescription>
                            {{ product?.description }}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <ProductConfigForm :product="product" :currency="currency" :initial-price="localPrice" :max-price="maxPrice"
                :amounts="amounts" @update:price="handlePriceUpdate" />

            <DialogFooter class="sm:justify-start">
                <Button @click="handleConfirm" class="flex-1 h-12">
                    {{ mode === 'edit' ? 'Update' : 'Add to Cart' }}
                </Button>
                <Button variant="outline" class="flex-1 h-12" @click="handleClose(false)">
                    Cancel
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
