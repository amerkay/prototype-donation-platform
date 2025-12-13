<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import type { CartItem, Product } from '@/lib/common/types'

interface Props {
  item: CartItem | Product
  currency: string
  isPulsing?: boolean
  price?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const { getCurrencySymbol } = useCurrency()

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

const tributeLabel = computed(() => {
  const item = props.item as CartItem
  if (!item.tribute || item.tribute.type === 'none') return ''

  const honoree = item.tribute.honoree
  if (!honoree) return ''

  const fullName = [honoree.firstName, honoree.lastName].filter(Boolean).join(' ')

  let label = ''
  if (item.tribute.type === 'gift') {
    label = `🎁 Gift to ${fullName}`
  } else if (item.tribute.type === 'memorial') {
    label = `🕊️ In memory of ${fullName}`
  }

  // Add eCard recipient if sending
  if (item.tribute.eCard?.send && item.tribute.eCard.recipient?.email) {
    label += ` • eCard to ${item.tribute.eCard.recipient.email}`
  }

  return label
})
</script>

<template>
  <div
    class="rounded-lg border bg-card p-3 transition-all"
    :class="{ 'pulse-highlight': isPulsing }"
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
            class="text-xs text-primary hover:underline"
            @click.stop="emit('edit')"
          >
            Edit
          </button>
        </div>
        <p v-if="hasTribute" class="text-xs text-muted-foreground mt-1">
          {{ tributeLabel }}
        </p>
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
