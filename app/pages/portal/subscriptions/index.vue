<script setup lang="ts">
import type { SubscriptionStatus } from '~/features/subscriptions/shared/types'
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CreditCard } from 'lucide-vue-next'
import SubscriptionCard from '~/features/subscriptions/donor/components/SubscriptionCard.vue'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({
  layout: 'portal'
})

const { subscriptions, succeededTransactions } = useDonorPortal()
const { formatAmount } = useCampaignFormatters()

/** Donor value per org (last 12 months), keyed by charityName */
const donorValueByOrg = computed(() => {
  const oneYearAgo = Date.now() - 365.25 * 24 * 60 * 60 * 1000
  const map = new Map<string, number>()
  for (const t of succeededTransactions.value) {
    if (new Date(t.createdAt).getTime() < oneYearAgo) continue
    map.set(t.charityName, (map.get(t.charityName) ?? 0) + t.totalAmount * t.exchangeRate)
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
</script>

<template>
  <div>
    <BreadcrumbBar :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'Subscriptions' }]" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Subscriptions</h1>
        <p class="text-sm text-muted-foreground">Your monthly giving, easy to update anytime.</p>
      </div>

      <ClientOnly>
        <!-- Status filters -->
        <FilterTabs v-model="activeFilter" :filters="statusFilters" :counts="filterCounts" />

        <Empty v-if="filteredSubscriptions.length === 0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CreditCard />
            </EmptyMedia>
            <EmptyTitle
              >No {{ activeFilter === 'all' ? '' : activeFilter }} subscriptions</EmptyTitle
            >
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
            <div class="flex items-baseline gap-2 mb-3">
              <h2 class="text-lg font-semibold">{{ charityName }}</h2>
              <span class="text-sm text-muted-foreground">
                {{ formatAmount(donorValueByOrg.get(charityName) ?? 0) }} donated this year
              </span>
            </div>
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <SubscriptionCard v-for="sub in subs" :key="sub.id" :subscription="sub" />
            </div>
          </section>
        </div>

        <template #fallback>
          <div class="flex gap-2">
            <Skeleton class="h-8 w-16 rounded-full" />
            <Skeleton class="h-8 w-16 rounded-full" />
            <Skeleton class="h-8 w-20 rounded-full" />
            <Skeleton class="h-8 w-12 rounded-full" />
          </div>
          <div class="space-y-4">
            <Skeleton class="h-40 rounded-xl" />
            <Skeleton class="h-40 rounded-xl" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
