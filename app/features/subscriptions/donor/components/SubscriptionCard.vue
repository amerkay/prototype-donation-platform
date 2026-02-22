<script setup lang="ts">
import type { Subscription } from '~/features/subscriptions/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Pause, Play, RefreshCw, X } from 'lucide-vue-next'

interface Props {
  subscription: Subscription
}

interface Emits {
  (e: 'pause' | 'resume' | 'cancel' | 'changeAmount', id: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

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
  <Card class="flex flex-col">
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="text-base">{{ subscription.campaignName }}</CardTitle>
        <StatusBadge :status="subscription.status">
          {{ subscription.status.replace('_', ' ') }}
        </StatusBadge>
      </div>
      <CardDescription>
        {{ formatAmount(subscription.amount, subscription.currency) }}/{{ subscription.frequency }}
        via
        {{ paymentMethodLabel(subscription.paymentMethod) }}
      </CardDescription>
    </CardHeader>
    <CardContent class="flex-1 flex flex-col">
      <div class="space-y-3">
        <div class="flex flex-col gap-1">
          <span v-for="item in subscription.lineItems" :key="item.productId" class="text-sm">
            {{ item.productTitle }}
            <span class="text-muted-foreground">
              ({{ formatAmount(item.unitPrice) }}/{{ item.frequency }})
            </span>
          </span>
        </div>

        <Separator />

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

      <div class="mt-auto pt-3 space-y-3">
        <Separator />
        <div class="flex flex-wrap gap-2">
          <Button
            v-if="subscription.status === 'active'"
            variant="outline"
            size="sm"
            @click="emit('pause', subscription.id)"
          >
            <Pause class="w-3.5 h-3.5 mr-1" />
            Pause
          </Button>
          <Button
            v-if="subscription.status === 'paused'"
            variant="outline"
            size="sm"
            @click="emit('resume', subscription.id)"
          >
            <Play class="w-3.5 h-3.5 mr-1" />
            Resume
          </Button>
          <Button
            v-if="subscription.status === 'active' || subscription.status === 'paused'"
            variant="outline"
            size="sm"
            @click="emit('cancel', subscription.id)"
          >
            <X class="w-3.5 h-3.5 mr-1" />
            Cancel
          </Button>
          <Button
            v-if="subscription.status === 'active'"
            variant="outline"
            size="sm"
            @click="emit('changeAmount', subscription.id)"
          >
            <RefreshCw class="w-3.5 h-3.5 mr-1" />
            Change Amount
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
