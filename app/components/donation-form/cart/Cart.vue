<script setup lang="ts">
import { ref } from 'vue'
import { getCartItemKey } from '@/lib/common/cart-utils'
import type { CartItem } from '@/lib/common/types'
import CartProductLine from '@/components/donation-form/cart/CartProductLine.vue'

interface Props {
    items: CartItem[]
    currency: string
    total: number
    recurringTotal?: number
    showTotal?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    edit: [item: CartItem, itemKey: string]
    remove: [itemId: string, addedAt: number]
}>()

const cartItemRefs = ref<Record<string, HTMLElement>>({})
const pulseNewItem = ref<string | null>(null)

const handleEdit = (item: CartItem) => {
    const itemKey = getCartItemKey(item.id, item.addedAt)
    emit('edit', item, itemKey)
}

const handleRemove = (item: CartItem) => {
    emit('remove', item.id, item.addedAt)
}

const { getCurrencySymbol } = useCurrency()

defineExpose({
    cartItemRefs,
    pulseNewItem,
    getCartItemKey
})
</script>

<template>
    <div v-if="items.length > 0" class="space-y-4">
        <TransitionGroup name="list" tag="div" class="space-y-2 scroll-mt-6">
            <CartProductLine v-for="item in items" :key="getCartItemKey(item.id, item.addedAt)"
                :ref="(el) => { if (el) cartItemRefs[getCartItemKey(item.id, item.addedAt)] = el as any }" :item="item"
                :currency="currency" :is-pulsing="pulseNewItem === getCartItemKey(item.id, item.addedAt)"
                @edit="handleEdit(item)" @remove="handleRemove(item)" />
        </TransitionGroup>

        <div v-if="showTotal" class="rounded-lg bg-muted p-3 space-y-2">
            <!-- Show breakdown when both one-time and recurring exist -->
            <template v-if="recurringTotal !== undefined && recurringTotal > 0 && (total - recurringTotal) > 0">
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">One-time</span>
                    <span class="text-base font-semibold">{{ getCurrencySymbol(currency) }}{{ total - recurringTotal
                        }}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Monthly Recurring</span>
                    <span class="text-base font-semibold">{{ getCurrencySymbol(currency) }}{{ recurringTotal }}</span>
                </div>
                <div class="flex items-center justify-between pt-2 border-t">
                    <span class="text-sm font-medium">Today's Total</span>
                    <span class="text-lg font-bold">{{ getCurrencySymbol(currency) }}{{ total }}</span>
                </div>
            </template>
            <!-- Show single line when only one type exists -->
            <template v-else>
                <div class="flex items-center justify-between">
                    <span class="text-sm font-medium">Total</span>
                    <span class="text-lg font-bold">{{ getCurrencySymbol(currency) }}{{ total }}</span>
                </div>
            </template>
        </div>
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
</style>
