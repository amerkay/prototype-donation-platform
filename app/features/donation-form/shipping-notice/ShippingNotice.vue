<script setup lang="ts">
import type { FormConfig } from '@/lib/common/types'

interface Props {
  requiresShipping: boolean
  shippingNoticeConfig: FormConfig['features']['shippingNotice']
}

defineProps<Props>()
</script>

<template>
  <Transition name="shipping-notice">
    <div
      v-if="shippingNoticeConfig.showNotice && requiresShipping"
      class="rounded-lg bg-muted p-3 text-sm text-muted-foreground"
    >
      {{ shippingNoticeConfig.noticeText }}
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
