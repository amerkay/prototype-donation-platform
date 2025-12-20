<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  requiresShipping: boolean
  // Optional: detailed shipping reason (used in Step 2)
  rewardCount?: number
  cartCount?: number
}

const props = defineProps<Props>()

// Compute message based on context
const message = computed(() => {
  // Step 2: Show detailed reason with counts
  if (props.rewardCount !== undefined || props.cartCount !== undefined) {
    const rewards = props.rewardCount || 0
    const cart = props.cartCount || 0

    if (rewards > 0 && cart > 0) {
      return `📦 ${rewards} reward${rewards === 1 ? '' : 's'} and ${cart} cart item${cart === 1 ? '' : 's'} require shipping`
    } else if (rewards > 0) {
      return `📦 ${rewards} reward${rewards === 1 ? '' : 's'} you chose require${rewards === 1 ? 's' : ''} shipping`
    } else if (cart > 0) {
      return `📦 ${cart} item${cart === 1 ? '' : 's'} in your cart require${cart === 1 ? 's' : ''} shipping`
    }
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
