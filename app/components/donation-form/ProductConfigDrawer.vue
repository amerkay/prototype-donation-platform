<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import ProductConfigForm from '@/components/donation-form/ProductConfigForm.vue'

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
    amounts?: number[]
}

interface Emits {
    (e: 'update:open', value: boolean): void
    (e: 'confirm', price: number): void
}

const props = withDefaults(defineProps<Props>(), {
    open: false,
    currency: '$',
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
    <Drawer :open="open" @update:open="handleClose" :dismissible="false">
        <DrawerContent>
            <DrawerHeader>
                <div class="flex items-center gap-3 mb-2">
                    <div class="text-4xl">{{ product?.thumbnail }}</div>
                    <div class="flex-1 min-w-0 text-left">
                        <DrawerTitle>{{ product?.name }}</DrawerTitle>
                        <DrawerDescription>
                            {{ product?.description }}
                        </DrawerDescription>
                    </div>
                </div>
            </DrawerHeader>

            <div class="px-4 pb-4">
                <ProductConfigForm :product="product" :currency="currency" :initial-price="initialPrice"
                    :max-price="maxPrice" :amounts="amounts" @update:price="handlePriceUpdate" />
            </div>

            <DrawerFooter>
                <Button @click="handleConfirm" class="h-12">
                    {{ mode === 'edit' ? 'Update' : 'Add to Cart' }}
                </Button>
                <DrawerClose as-child>
                    <Button variant="outline" class="h-12">
                        Cancel
                    </Button>
                </DrawerClose>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
</template>
