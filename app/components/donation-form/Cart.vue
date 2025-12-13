<script setup lang="ts">
import { ref } from 'vue'
import CartProductLine from '@/components/donation-form/CartProductLine.vue'
import type { CartItem } from '@/composables/useCart'

interface Props {
    items: CartItem[]
    currency: string
    total: number
    showTotal?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    edit: [item: CartItem, itemKey: string]
    remove: [itemId: string, addedAt: number]
}>()

const cartItemRefs = ref<Record<string, HTMLElement>>({})
const pulseNewItem = ref<string | null>(null)

const getCartItemKey = (itemId: string, addedAt: number) => `${itemId}___${addedAt}`

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

        <div v-if="showTotal" class="rounded-lg bg-muted p-3 flex items-center justify-between">
            <span class="text-sm font-medium">Total</span>
            <span class="text-lg font-bold">{{ getCurrencySymbol(currency) }}{{ total }}</span>
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
