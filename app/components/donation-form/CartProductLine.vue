<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { CartItem } from '@/composables/useCart'

interface Props {
    item: CartItem
    currency: string
    isPulsing?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    edit: []
    remove: []
}>()

const { getCurrencySymbol } = useCurrency()
</script>

<template>
    <div class="rounded-lg border bg-card p-3 transition-all" :class="{ 'pulse-highlight': isPulsing }">
        <div class="flex items-center gap-3">
            <div class="text-2xl">{{ item.thumbnail }}</div>
            <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ item.name }}</p>
                <div class="flex items-center gap-2">
                    <p class="text-xs text-muted-foreground">
                        {{ getCurrencySymbol(currency) }}{{ item.price }}
                        <span v-if="item.frequency === 'monthly'">/month</span>
                    </p>
                    <button v-if="item.frequency === 'monthly' && item.minPrice" @click="emit('edit')"
                        class="text-xs text-primary hover:underline">
                        Edit
                    </button>
                </div>
            </div>
            <Button variant="ghost" size="sm" @click="emit('remove')">
                ✕
            </Button>
        </div>
    </div>
</template>

<style scoped>
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
</style>
