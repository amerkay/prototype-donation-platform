<script setup lang="ts">
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import type { Product } from '~/features/donation-form/features/product/shared/types'

interface Props {
  product: Product
  currency: string
  baseCurrency?: string
  icon?: string
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  icon: 'lucide:plus',
  active: false
})

const emit = defineEmits<{
  click: []
}>()

const { getCurrencySymbol } = useCurrency(props.baseCurrency)
</script>

<template>
  <button
    type="button"
    class="w-full rounded-lg border p-3 transition-all text-left"
    :class="active ? 'bg-primary/10 border-primary hover:bg-primary/15' : 'bg-card hover:shadow-sm'"
    @click="emit('click')"
  >
    <div class="flex items-center gap-2 sm:gap-3">
      <div class="text-2xl sm:text-3xl shrink-0">{{ product.image }}</div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold text-sm leading-tight truncate">{{ product.name }}</h3>
        <p class="text-xs text-muted-foreground line-clamp-2">{{ product.description }}</p>
        <p class="text-xs font-semibold text-foreground mt-0.5">
          <span v-if="product.frequency === 'once'">
            {{ getCurrencySymbol(currency) }}{{ product.price }} one-time
          </span>
          <span v-else-if="product.frequency === 'monthly'"> Monthly </span>
          <span v-else-if="product.frequency === 'yearly'"> Yearly </span>
        </p>
      </div>
      <div
        class="shrink-0 flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground"
      >
        <Icon :name="icon" class="size-4" />
      </div>
    </div>
  </button>
</template>
