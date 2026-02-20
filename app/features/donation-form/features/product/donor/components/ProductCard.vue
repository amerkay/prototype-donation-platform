<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import type { Product } from '~/features/donation-form/features/product/shared/types'

interface Props {
  product: Product
  currency: string
  baseCurrency?: string
  icon?: string
  active?: boolean
  remaining?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  icon: 'lucide:plus',
  active: false,
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const { getCurrencySymbol } = useCurrency(() => props.baseCurrency)

const isSoldOut = computed(() => props.remaining === 0)
</script>

<template>
  <button
    type="button"
    class="w-full rounded-lg border p-3 transition-all text-left"
    :class="
      cn(
        disabled || isSoldOut
          ? 'opacity-50 cursor-not-allowed bg-muted'
          : active
            ? 'bg-primary/10 border-primary hover:bg-primary/15'
            : 'bg-card hover:shadow-sm'
      )
    "
    :disabled="disabled || isSoldOut"
    @click="emit('click')"
  >
    <div class="flex items-center gap-2 sm:gap-3">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.title"
        class="w-10 h-10 rounded-md object-cover shrink-0"
        data-field="basic.image"
      />
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm leading-tight truncate" data-field="basic.title">
          {{ product.title }}
        </h3>
        <p class="text-xs text-muted-foreground line-clamp-2" data-field="basic.description">
          {{ product.description }}
        </p>
        <div class="flex items-center gap-2 mt-0.5" data-field="pricing">
          <p class="text-xs font-semibold text-foreground">
            <span v-if="product.frequency === 'once'">
              {{ getCurrencySymbol(currency) }}{{ product.price }} one-time
            </span>
            <span v-else-if="product.frequency === 'monthly'"> Monthly </span>
            <span v-else-if="product.frequency === 'yearly'"> Yearly </span>
          </p>
          <span v-if="isSoldOut" class="text-xs font-medium text-destructive"> Sold out </span>
          <span
            v-else-if="remaining !== undefined"
            class="text-xs font-medium text-muted-foreground"
          >
            {{ remaining }} remaining
          </span>
        </div>
      </div>
      <div
        v-if="!isSoldOut"
        class="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground"
      >
        <Icon :name="icon" class="size-4" />
      </div>
    </div>
  </button>
</template>
