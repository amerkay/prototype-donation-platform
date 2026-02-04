<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Pause, Play, X, RefreshCw } from 'lucide-vue-next'
definePageMeta({
  layout: 'portal'
})

const { formatAmount, formatDate } = useCampaignFormatters()
const { subscriptions } = useDonorPortal()

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
  <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
    <div class="py-4 space-y-1">
      <h1 class="text-xl font-semibold tracking-tight">Subscriptions</h1>
      <p class="text-sm text-muted-foreground">Manage your recurring donations.</p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <Card v-for="sub in subscriptions" :key="sub.id">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <CardTitle class="text-base">{{ sub.campaignName }}</CardTitle>
            <Badge
              variant="outline"
              :data-campaign-status="sub.status"
              class="border-(--cs-border) text-(--cs-text)"
            >
              <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
              {{ sub.status.replace('_', ' ') }}
            </Badge>
          </div>
          <CardDescription>
            {{ formatAmount(sub.amount) }}/{{ sub.frequency }} via
            {{ paymentMethodLabel(sub.paymentMethod) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex flex-col gap-1">
            <span v-for="item in sub.lineItems" :key="item.productId" class="text-sm">
              {{ item.productIcon }} {{ item.productName }}
              <span class="text-muted-foreground">
                ({{ formatAmount(item.unitPrice) }}/{{ item.frequency }})
              </span>
            </span>
          </div>

          <Separator />

          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span class="text-muted-foreground">Total paid</span>
              <p class="font-medium">{{ formatAmount(sub.totalPaid) }}</p>
            </div>
            <div>
              <span class="text-muted-foreground">Payments</span>
              <p class="font-medium">{{ sub.paymentCount }}</p>
            </div>
            <div v-if="sub.nextBillingDate">
              <span class="text-muted-foreground">Next billing</span>
              <p class="font-medium">{{ formatDate(sub.nextBillingDate) }}</p>
            </div>
            <div>
              <span class="text-muted-foreground">Since</span>
              <p class="font-medium">{{ formatDate(sub.createdAt) }}</p>
            </div>
          </div>

          <Separator />

          <div class="flex flex-wrap gap-2">
            <Button v-if="sub.status === 'active'" variant="outline" size="sm" disabled>
              <Pause class="w-3.5 h-3.5 mr-1" />
              Pause
            </Button>
            <Button v-if="sub.status === 'paused'" variant="outline" size="sm" disabled>
              <Play class="w-3.5 h-3.5 mr-1" />
              Resume
            </Button>
            <Button
              v-if="sub.status === 'active' || sub.status === 'paused'"
              variant="outline"
              size="sm"
              disabled
            >
              <X class="w-3.5 h-3.5 mr-1" />
              Cancel
            </Button>
            <Button v-if="sub.status === 'active'" variant="outline" size="sm" disabled>
              <RefreshCw class="w-3.5 h-3.5 mr-1" />
              Change Amount
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
