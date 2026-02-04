<script setup lang="ts">
import type { SubscriptionStatus } from '~/features/donor-portal/types'
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CreditCard, Pause, Play, RefreshCw, X } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const { formatAmount, formatDate } = useCampaignFormatters()
const { subscriptions } = useDonorPortal()

const statusFilters: { value: SubscriptionStatus | 'all'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' }
]

const activeFilter = ref<SubscriptionStatus | 'all'>('active')

const filteredSubscriptions = computed(() =>
  activeFilter.value === 'all'
    ? subscriptions.value
    : subscriptions.value.filter((s) => s.status === activeFilter.value)
)

const subscriptionsByCharity = computed(() => {
  const grouped = new Map<string, typeof filteredSubscriptions.value>()
  for (const sub of filteredSubscriptions.value) {
    const existing = grouped.get(sub.charityName)
    if (existing) existing.push(sub)
    else grouped.set(sub.charityName, [sub])
  }
  return grouped
})

const filterCount = (status: SubscriptionStatus | 'all') =>
  status === 'all'
    ? subscriptions.value.length
    : subscriptions.value.filter((s) => s.status === status).length

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
  <div>
    <AdminBreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'Subscriptions' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p class="text-sm text-muted-foreground">Manage your recurring donations.</p>
      </div>

      <!-- Status filters -->
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="filter in statusFilters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'default' : 'outline'"
          size="sm"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <Badge variant="secondary" class="ml-1.5 px-1.5 min-w-5 justify-center">
            {{ filterCount(filter.value) }}
          </Badge>
        </Button>
      </div>

      <Empty v-if="filteredSubscriptions.length === 0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>No {{ activeFilter === 'all' ? '' : activeFilter }} subscriptions</EmptyTitle>
          <EmptyDescription>
            <template v-if="activeFilter === 'all'">
              You don't have any recurring donations yet. Start a subscription from any campaign
              page.
            </template>
            <template v-else> No subscriptions with status "{{ activeFilter }}". </template>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <div v-else class="space-y-8">
        <section v-for="[charityName, subs] in subscriptionsByCharity" :key="charityName">
          <h2 class="text-lg font-semibold mb-3">{{ charityName }}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <Card v-for="sub in subs" :key="sub.id">
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

                <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div class="space-y-0.5">
                    <span class="text-xs text-muted-foreground">Total paid</span>
                    <p class="text-sm font-medium">{{ formatAmount(sub.totalPaid) }}</p>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-xs text-muted-foreground">Payments</span>
                    <p class="text-sm font-medium">{{ sub.paymentCount }}</p>
                  </div>
                  <div v-if="sub.nextBillingDate" class="space-y-0.5">
                    <span class="text-xs text-muted-foreground">Next billing</span>
                    <p class="text-sm font-medium">{{ formatDate(sub.nextBillingDate) }}</p>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-xs text-muted-foreground">Since</span>
                    <p class="text-sm font-medium">{{ formatDate(sub.createdAt) }}</p>
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
        </section>
      </div>
    </div>
  </div>
</template>
