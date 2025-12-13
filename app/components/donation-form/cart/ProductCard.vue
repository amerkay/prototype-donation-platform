<script setup lang="ts">
import type { Product } from '@/lib/common/types'

interface Props {
    product: Product
    currency: string
    isInCart: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    click: []
}>()

const { getCurrencySymbol } = useCurrency()
</script>

<template>
    <button type="button" :disabled="isInCart" @click="emit('click')"
        class="w-full rounded-lg border bg-card p-3 transition-all hover:shadow-sm disabled:cursor-not-allowed text-left">
        <div class="flex items-center gap-2 sm:gap-3">
            <div class="text-2xl sm:text-3xl shrink-0">{{ product.image }}</div>
            <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-sm leading-tight truncate">{{ product.name }}</h3>
                <p class="text-xs text-muted-foreground line-clamp-1">{{ product.description }}</p>
                <p class="text-xs font-semibold text-foreground mt-0.5">
                    <span v-if="product.frequency === 'once'">
                        {{ getCurrencySymbol(currency) }}{{ product.price }} one-time
                    </span>
                    <span v-else>
                        Monthly
                    </span>
                </p>
            </div>
            <div class="shrink-0 flex items-center justify-center w-8 h-8 rounded-md"
                :class="isInCart ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400' : 'bg-primary text-primary-foreground'">
                <svg v-if="!isInCart" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                </svg>
            </div>
        </div>
    </button>
</template>
