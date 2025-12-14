<script setup lang="ts">
import { computed } from 'vue'
import type { Product, CartItem, FormConfig } from '@/lib/common/types'

interface Props {
  selectedFrequency: 'once' | 'monthly' | 'multiple'
  products: Product[]
  selectedRewards: Set<string>
  multipleCart: CartItem[]
  donationAmounts: {
    once: number
    monthly: number
    yearly: number
  }
  shippingNoticeConfig: FormConfig['features']['shippingNotice']
}

const props = defineProps<Props>()

const requiresShipping = computed(() => {
  if (props.selectedFrequency === 'multiple') {
    // For multiple tab: check cart items and selected rewards
    const cartRequiresShipping = props.multipleCart.some((item) => item.isShippingRequired)
    const selectedRewardsRequireShipping = Array.from(props.selectedRewards).some(
      (itemId) => props.products.find((p) => p.id === itemId)?.isShippingRequired
    )
    return cartRequiresShipping || selectedRewardsRequireShipping
  } else {
    // For once/monthly tabs: only check rewards that are currently eligible on this tab
    const currentTotal =
      props.selectedFrequency === 'once'
        ? props.donationAmounts.once
        : props.donationAmounts.monthly

    // Get eligible rewards for current tab only
    const eligibleItemsOnCurrentTab = props.products.filter((item) => {
      if (!item.isReward || !item.rewardThreshold) return false
      const { once, monthly } = item.rewardThreshold

      if (props.selectedFrequency === 'once') {
        // For once tab: only items with 'once' threshold that are met
        if (once !== undefined && currentTotal >= once) return true
        // Or items with both thresholds where once is met
        if (once !== undefined && monthly !== undefined && currentTotal >= once) return true
      } else {
        // For monthly tab: only items with 'monthly' threshold that are met
        if (monthly !== undefined && currentTotal >= monthly) return true
        // Or items with both thresholds where monthly is met
        if (once !== undefined && monthly !== undefined && currentTotal >= monthly) return true
      }
      return false
    })

    // Check if any eligible AND selected items require shipping
    return Array.from(props.selectedRewards).some((itemId) => {
      const item = eligibleItemsOnCurrentTab.find((p) => p.id === itemId)
      return item?.isShippingRequired
    })
  }
})
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
