<script setup lang="ts">
import type { Subscription } from '~/features/subscriptions/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  subscription: Subscription
}

defineProps<Props>()

const { formatAmount, formatDate } = useCampaignFormatters()

const paymentMethodLabel = (pm: {
  type: string
  last4?: string
  brand?: string
  email?: string
}) => {
  if (pm.type === 'card' && pm.brand && pm.last4) return `${pm.brand} ****${pm.last4}`
  if (pm.type === 'paypal') return 'PayPal'
  if (pm.type === 'bank_transfer') return 'Bank Transfer'
  return pm.type
}
</script>

<template>
  <NuxtLink :to="`/portal/subscriptions/${subscription.id}`" class="block">
    <Card class="flex flex-col hover:border-primary/40 transition-colors cursor-pointer">
      <CardHeader class="pb-3">
        <div class="flex items-center justify-between">
          <CardTitle class="text-base">{{ subscription.campaignName }}</CardTitle>
          <StatusBadge :status="subscription.status">
            {{ subscription.status.replace('_', ' ') }}
          </StatusBadge>
        </div>
        <CardDescription>
          {{ formatAmount(subscription.amount, subscription.currency) }}/{{
            subscription.frequency
          }}
          via
          {{ paymentMethodLabel(subscription.paymentMethod) }}
        </CardDescription>
      </CardHeader>
      <CardContent class="flex-1 flex flex-col">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div class="space-y-0.5">
              <span class="text-xs text-muted-foreground">Total paid</span>
              <p class="text-sm font-medium">{{ formatAmount(subscription.totalPaid) }}</p>
            </div>
            <div class="space-y-0.5">
              <span class="text-xs text-muted-foreground">Payments</span>
              <p class="text-sm font-medium">{{ subscription.paymentCount }}</p>
            </div>
            <div
              v-if="subscription.status === 'cancelled' || subscription.nextBillingDate"
              class="space-y-0.5"
            >
              <span class="text-xs text-muted-foreground">Next billing</span>
              <p class="text-sm font-medium">
                {{ subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '-' }}
              </p>
            </div>
            <div class="space-y-0.5">
              <span class="text-xs text-muted-foreground">Since</span>
              <p class="text-sm font-medium">{{ formatDate(subscription.createdAt) }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
