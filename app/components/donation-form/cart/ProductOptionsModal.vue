<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Button } from '@/components/ui/button'
import BaseDialogOrDrawer from '~/components/donation-form/common/BaseDialogOrDrawer.vue'
import DonationAmountSelector from '~/components/donation-form/common/DonationAmountSelector.vue'
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

const { getCurrencySymbol } = useCurrency()
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const localPrice = ref(props.initialPrice)

watch(() => props.initialPrice, (newPrice) => {
    localPrice.value = newPrice
}, { immediate: true })

const displayPrice = computed(() => localPrice.value)

const isRecurring = computed(() => props.product?.frequency === 'monthly' || props.product?.frequency === 'yearly')
const hasPresetAmounts = computed(() => isRecurring.value && props.amounts.length > 0)
const frequencyLabel = computed(() => {
    if (!props.product) return 'donation'
    if (props.product.frequency === 'monthly') return 'monthly donation'
    if (props.product.frequency === 'yearly') return 'yearly donation'
    return 'one-time donation'
})

const handleClose = (open: boolean) => {
    emit('update:open', open)
}

const handleConfirm = () => {
    emit('confirm', displayPrice.value)
    emit('update:open', false)
}
</script>

<template>
    <BaseDialogOrDrawer :open="open" @update:open="handleClose">
        <template #header>
            <div class="flex items-center gap-3 mb-2">
                <div class="text-4xl">{{ product?.thumbnail }}</div>
                <div class="flex-1 min-w-0 text-left">
                    <h2 class="text-lg font-semibold">{{ product?.name }}</h2>
                    <p class="text-sm text-muted-foreground">
                        {{ product?.description }}
                    </p>
                </div>
            </div>
        </template>

        <template #content>
            <div class="space-y-4">
                <!-- One-time fixed price display -->
                <div v-if="!isRecurring" class="rounded-lg bg-muted p-4 text-center">
                    <p class="text-sm text-muted-foreground">One-time donation</p>
                    <p class="text-3xl font-bold">{{ currencySymbol }}{{ product?.price }}</p>
                </div>

                <!-- Recurring with preset amounts -->
                <DonationAmountSelector v-else-if="hasPresetAmounts" v-model="localPrice" :amounts="amounts"
                    :currency="currency" :min-price="product?.minPrice ?? 0" :max-price="maxPrice"
                    :frequency-label="frequencyLabel" :frequency="product?.frequency ?? 'once'" />

                <!-- Recurring without preset amounts -->
                <DonationAmountSelector v-else-if="isRecurring" v-model="localPrice" :amounts="[]" :currency="currency"
                    :min-price="product?.minPrice ?? 0" :max-price="maxPrice" :frequency-label="frequencyLabel"
                    :frequency="product?.frequency ?? 'once'" />
            </div>
        </template>

        <template #footer>
            <Button @click="handleConfirm" class="flex-1 md:flex-1 h-12">
                {{ mode === 'edit' ? 'Update' : 'Add to Cart' }}
            </Button>
            <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleClose(false)">
                Cancel
            </Button>
        </template>
    </BaseDialogOrDrawer>
</template>
