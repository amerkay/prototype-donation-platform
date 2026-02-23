<script setup lang="ts">
import type { SubscriptionStatus } from '~/features/subscriptions/shared/types'
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CreditCard } from 'lucide-vue-next'
import SubscriptionCard from '~/features/subscriptions/donor/components/SubscriptionCard.vue'
import { useSubscriptionActions } from '~/features/subscriptions/shared/composables/useSubscriptionActions'
import SubscriptionActionDialogs from '~/features/subscriptions/shared/components/SubscriptionActionDialogs.vue'

definePageMeta({
  layout: 'portal'
})

const { subscriptions, succeededTransactions } = useDonorPortal()
const { checkEligibility } = useActionEligibility()

const donorValueLastYear = computed(() => {
  const oneYearAgo = Date.now() - 365.25 * 24 * 60 * 60 * 1000
  return succeededTransactions.value
    .filter((t) => new Date(t.createdAt).getTime() >= oneYearAgo)
    .reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
})

const subscriptionEligibility = computed(() => {
  const map = new Map<string, { canPause: boolean; canCancel: boolean }>()
  for (const sub of subscriptions.value) {
    const result = checkEligibility({
      subscription: sub,
      donorValueLastYear: donorValueLastYear.value
    })
    map.set(sub.id, { canPause: result.canPause, canCancel: result.canCancel })
  }
  return map
})

const statusFilters = [
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

const filterCounts = computed(() => {
  const counts: Record<string, number> = { all: subscriptions.value.length }
  for (const s of subscriptions.value) {
    counts[s.status] = (counts[s.status] ?? 0) + 1
  }
  return counts
})

const {
  showPauseDialog,
  confirmPause,
  handlePause,
  showCancelDialog,
  confirmCancel,
  handleCancel,
  handleResume,
  changeAmountState,
  openChangeAmount,
  handleChangeAmount,
  currentSubscription
} = useSubscriptionActions(subscriptions)
</script>

<template>
  <div>
    <AdminBreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'Subscriptions' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p class="text-sm text-muted-foreground">Your monthly giving, easy to update anytime.</p>
      </div>

      <!-- Status filters -->
      <FilterTabs v-model="activeFilter" :filters="statusFilters" :counts="filterCounts" />

      <Empty v-if="filteredSubscriptions.length === 0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCard />
          </EmptyMedia>
          <EmptyTitle>No {{ activeFilter === 'all' ? '' : activeFilter }} subscriptions</EmptyTitle>
          <EmptyDescription>
            <template v-if="activeFilter === 'all'">
              No subscriptions yet. When you set up monthly giving, they'll show up here.
            </template>
            <template v-else> No subscriptions with status "{{ activeFilter }}". </template>
          </EmptyDescription>
        </EmptyHeader>
      </Empty>

      <div v-else class="space-y-8">
        <section v-for="[charityName, subs] in subscriptionsByCharity" :key="charityName">
          <h2 class="text-lg font-semibold mb-3">{{ charityName }}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <SubscriptionCard
              v-for="sub in subs"
              :key="sub.id"
              :subscription="sub"
              :can-pause="subscriptionEligibility.get(sub.id)?.canPause"
              :can-cancel="subscriptionEligibility.get(sub.id)?.canCancel"
              @pause="confirmPause"
              @resume="handleResume"
              @cancel="confirmCancel"
              @change-amount="openChangeAmount"
            />
          </div>
        </section>
      </div>
    </div>

    <SubscriptionActionDialogs
      v-model:show-pause-dialog="showPauseDialog"
      v-model:show-cancel-dialog="showCancelDialog"
      v-model:change-amount-state="changeAmountState"
      :current-subscription="currentSubscription"
      @pause="handlePause"
      @cancel="handleCancel"
      @change-amount="handleChangeAmount"
    />
  </div>
</template>
