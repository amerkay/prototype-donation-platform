<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCurrency } from '~/features/donation-form/donor/composables/useCurrency'
import TributeLine from '~/features/donation-form/features/tribute/donor/components/TributeLine.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/shared/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/shared/types'

interface Props {
  item: CartItem | Product
  currency: string
  baseCurrency?: string
  isPulsing?: boolean
  price?: number
  tributeConfig: TributeSettings
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP'
})

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const { getCurrencySymbol } = useCurrency(props.baseCurrency)

const displayPrice = computed(() => {
  return props.price ?? (props.item as CartItem).price ?? 0
})

const displayQuantity = computed(() => {
  return (props.item as CartItem).quantity ?? 1
})

const isOneTime = computed(() => props.item.frequency === 'once')

const hasEditOption = computed(() => {
  return !!(props.item.minPrice || props.item.default || isOneTime.value)
})

const hasTribute = computed(() => {
  const item = props.item as CartItem
  return item.tribute && item.tribute.type !== 'none'
})
</script>

<template>
  <div
    class="rounded-lg border bg-card p-3 transition-all"
    :class="{
      'pulse-highlight': isPulsing,
      'cursor-pointer hover:bg-accent': hasEditOption
    }"
    @click="hasEditOption && emit('edit')"
  >
    <div class="flex items-center gap-3">
      <div class="text-2xl">{{ item.thumbnail }}</div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm truncate">{{ item.name }}</p>
        <div class="flex items-center gap-2">
          <p class="text-xs text-muted-foreground">
            <span v-if="isOneTime && displayQuantity > 1">{{ displayQuantity }} × </span
            >{{ getCurrencySymbol(currency) }}{{ displayPrice }}
            <span v-if="item.frequency === 'monthly'">/month</span>
            <span v-else-if="item.frequency === 'yearly'">/year</span>
            <span v-if="isOneTime && displayQuantity > 1" class="font-medium">
              = {{ getCurrencySymbol(currency) }}{{ displayPrice * displayQuantity }}</span
            >
          </p>
          <button
            v-if="hasEditOption"
            class="text-xs text-primary hover:underline pointer-events-none"
            @click.stop
          >
            Edit
          </button>
        </div>

        <TributeLine
          v-if="hasTribute"
          class="mt-2"
          :tribute="(item as CartItem).tribute!"
          :config="tributeConfig"
        />
      </div>
      <Button variant="ghost" size="sm" @click.stop="emit('remove')"> ✕ </Button>
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
  animation: pulse-highlight 0.333s ease-in-out 3;
}
</style>
