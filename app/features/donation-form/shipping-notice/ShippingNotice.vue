<script setup lang="ts">
interface Props {
  requiresShipping: boolean
}

defineProps<Props>()
</script>

<template>
  <Transition name="shipping-notice">
    <div
      v-if="requiresShipping"
      class="rounded-lg bg-muted p-3 text-sm text-muted-foreground"
    >
      📦 Shipping address on next page
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
