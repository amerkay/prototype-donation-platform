<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import TributeLine from '~/features/donation-form/features/tribute/donor/components/TributeLine.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'
import type { CustomFieldDefinition } from '~/features/_library/custom-fields/types'

interface Props {
  item: CartItem | Product
  currency: string
  baseCurrency?: string
  isPulsing?: boolean
  price?: number
  tributeConfig: TributeSettings
  entryFieldDefinitions?: CustomFieldDefinition[]
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP'
})

const emit = defineEmits<{
  edit: []
  remove: []
}>()

const { getCurrencySymbol } = useCurrency(() => props.baseCurrency)

const displayPrice = computed(() => {
  return props.price ?? (props.item as CartItem).price ?? 0
})

const displayQuantity = computed(() => {
  return (props.item as CartItem).quantity ?? 1
})

const isOneTime = computed(() => props.item.frequency === 'once')

const hasEntryData = computed(() => {
  const item = props.item as CartItem
  return item.entryData && Object.keys(item.entryData).length > 0
})

const hasEditOption = computed(() => {
  if (props.editable === false) return false
  return !!(props.item.minPrice || props.item.default || isOneTime.value || hasEntryData.value)
})

const hasTribute = computed(() => {
  const item = props.item as CartItem
  return item.tribute && item.tribute.type !== 'none'
})

/** Summarize entry data as "Label: value" pairs, using form-level field definitions for labels */
const entryDataSummary = computed(() => {
  const item = props.item as CartItem
  if (!item.entryData || !props.entryFieldDefinitions?.length) return ''
  const pairs: string[] = []
  for (const field of props.entryFieldDefinitions) {
    const value = item.entryData[field.id]
    if (value === undefined || value === null || value === '') continue
    const display = Array.isArray(value) ? value.join(', ') : String(value)
    pairs.push(`${field.label}: ${display}`)
  }
  const summary = pairs.join(' | ')
  return summary.length > 80 ? `${summary.slice(0, 77)}...` : summary
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
      <img
        v-if="item.image"
        :src="item.image"
        :alt="item.name"
        class="w-8 h-8 rounded-md object-cover shrink-0"
      />
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

        <p v-if="entryDataSummary" class="mt-1 text-xs text-muted-foreground truncate">
          {{ entryDataSummary }}
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
