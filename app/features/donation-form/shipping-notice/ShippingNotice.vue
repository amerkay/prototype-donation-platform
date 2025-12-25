<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  requiresShipping: boolean
  cartCount?: number
}

const props = defineProps<Props>()

// Compute message based on context
const message = computed(() => {
  // Step 2: Show detailed reason with counts
  if (props.cartCount !== undefined) {
    const cart = props.cartCount || 0

    return `📦 ${cart} item${cart === 1 ? '' : 's'} in your cart require${cart === 1 ? 's' : ''} shipping`
  }

  // Step 1: Simple message
  return '📦 Shipping address on next page'
})
</script>

<template>
  <Transition name="shipping-notice">
    <div v-if="requiresShipping" class="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.shipping-notice-enter-active,
.shipping-notice-leave-active {
  transition: all 0.3s ease;
}

.shipping-notice-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.shipping-notice-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
