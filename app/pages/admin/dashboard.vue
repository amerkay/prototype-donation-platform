<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDateRangePicker from '~/features/_admin/components/AdminDateRangePicker.vue'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  PoundSterling,
  Users,
  CreditCard,
  Megaphone,
  TrendingUp,
  ArrowRight
} from 'lucide-vue-next'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { transactions } from '~/sample-api-responses/api-sample-response-transactions'
import { formatCurrency } from '~/lib/formatCurrency'

import { formatDateCompact } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'

definePageMeta({ layout: 'admin' })

const { campaigns, activeCampaigns } = useCampaigns()
const { totalDonors } = useDonors()
const { totalRevenue, totalDonations } = useDonations()
const { activeSubscriptions, monthlyRecurringRevenue } = useAdminSubscriptions()

const breadcrumbs = [{ label: 'Dashboard' }]

const dateStore = useAdminDateRangeStore()

// Stats cards with navigation targets
const statCards = computed(() => [
  {
    title: 'Total Revenue',
    value: formatCurrency(totalRevenue.value, 'GBP', 0),
    subtitle: `${totalDonations.value} donations`,
    icon: PoundSterling,
    to: '/admin/donations'
  },
  {
    title: 'Total Donors',
    value: totalDonors.value,
    subtitle: 'Unique donors',
    icon: Users,
    to: '/admin/donors'
  },
  {
    title: 'Active Subscriptions',
    value: activeSubscriptions.value.length,
    subtitle: `${formatCurrency(monthlyRecurringRevenue.value, 'GBP')} MRR`,
    icon: CreditCard,
    to: '/admin/subscriptions'
  },
  {
    title: 'Active Campaigns',
    value: activeCampaigns.value.length,
    subtitle: `of ${campaigns.value.length} total`,
    icon: Megaphone,
    to: '/admin/campaigns/standard'
  }
])

// Filter transactions by shared date range
const dashboardTransactions = computed(() =>
  [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .filter((t) => dateStore.isWithinRange(t.createdAt))
)

// Recent activity (first 8)
const recentActivity = computed(() =>
  dashboardTransactions.value.slice(0, 8).map((t) => ({
    id: t.id,
    donor: t.isAnonymous ? 'Anonymous' : t.donorName,
    campaign: t.campaignName,
    amount: formatCurrency(t.totalAmount, t.currency),
    status: t.status,
    date: formatDateCompact(t.createdAt),
    isRecurring: t.type === 'subscription_payment'
  }))
)

// Monthly revenue chart data (last 6 months)
const monthlyRevenue = computed(() => {
  const buckets: Record<string, { revenue: number; count: number }> = {}
  const succeeded = dashboardTransactions.value.filter((t) => t.status === 'succeeded')

  for (const t of succeeded) {
    const d = new Date(t.createdAt)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!buckets[key]) buckets[key] = { revenue: 0, count: 0 }
    buckets[key].revenue += t.subtotal * t.exchangeRate
    buckets[key].count++
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => {
      const [y, m] = month.split('-')
      const label = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(
        new Date(Number(y), Number(m) - 1)
      )
      return { month, label, ...data }
    })
})

const maxRevenue = computed(() => Math.max(...monthlyRevenue.value.map((m) => m.revenue), 1))

// Revenue by campaign (top 5)
const campaignRevenue = computed(() => {
  const buckets: Record<string, { name: string; revenue: number; count: number }> = {}
  const succeeded = dashboardTransactions.value.filter((t) => t.status === 'succeeded')

  for (const t of succeeded) {
    if (!buckets[t.campaignId])
      buckets[t.campaignId] = { name: t.campaignName, revenue: 0, count: 0 }
    const bucket = buckets[t.campaignId]!
    bucket.revenue += t.subtotal * t.exchangeRate
    bucket.count++
  }

  return Object.values(buckets)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
})

const maxCampaignRevenue = computed(() =>
  Math.max(...campaignRevenue.value.map((c) => c.revenue), 1)
)

// Top campaigns by total raised
const topCampaigns = computed(() =>
  [...campaigns.value]
    .filter((c) => c.type !== 'fundraiser')
    .sort((a, b) => b.stats.totalRaised - a.stats.totalRaised)
    .slice(0, 5)
)
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4 space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <AdminDateRangePicker v-model="dateStore.dateRange" />
      </div>

      <!-- Stats Cards — clickable with hover glow -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink v-for="stat in statCards" :key="stat.to" :to="stat.to" class="group">
          <Card
            class="transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
          >
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">{{ stat.title }}</CardTitle>
              <component
                :is="stat.icon"
                class="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors"
              />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stat.value }}</div>
              <p class="text-xs text-muted-foreground">{{ stat.subtitle }}</p>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>

      <!-- Charts Row -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Monthly Revenue Bar Chart -->
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Donation revenue by month</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="monthlyRevenue.length" class="space-y-3">
              <div v-for="m in monthlyRevenue" :key="m.month" class="space-y-1">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium w-10">{{ m.label }}</span>
                  <span class="text-muted-foreground text-xs"> {{ m.count }} donations </span>
                  <span class="font-medium tabular-nums">
                    {{ formatCurrency(m.revenue, 'GBP', 0) }}
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    class="h-full rounded-full bg-primary transition-all"
                    :style="{ width: `${(m.revenue / maxRevenue) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No data for selected range.</p>
          </CardContent>
        </Card>

        <!-- Revenue by Campaign -->
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Campaign</CardTitle>
            <CardDescription>Top campaigns by donation income</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="campaignRevenue.length" class="space-y-3">
              <div v-for="c in campaignRevenue" :key="c.name" class="space-y-1">
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium truncate flex-1 mr-2">{{ c.name }}</span>
                  <span class="font-medium tabular-nums shrink-0">
                    {{ formatCurrency(c.revenue, 'GBP', 0) }}
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    class="h-full rounded-full bg-primary/70 transition-all"
                    :style="{ width: `${(c.revenue / maxCampaignRevenue) * 100}%` }"
                  />
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground">No data for selected range.</p>
          </CardContent>
        </Card>
      </div>

      <!-- Activity & Campaigns Grid -->
      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Recent Activity -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest donations across all campaigns</CardDescription>
            </div>
            <NuxtLink to="/admin/donations">
              <Button variant="outline" size="sm">
                View all
                <ArrowRight class="ml-1 h-4 w-4" />
              </Button>
            </NuxtLink>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-center justify-between gap-2"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm font-medium truncate">{{ activity.donor }}</span>
                    <Badge v-if="activity.isRecurring" variant="secondary" class="text-xs shrink-0">
                      <TrendingUp class="h-3 w-3 mr-0.5" />
                      Recurring
                    </Badge>
                  </div>
                  <p class="text-xs text-muted-foreground truncate">{{ activity.campaign }}</p>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-sm font-medium">{{ activity.amount }}</span>
                  <p class="text-xs text-muted-foreground">{{ activity.date }}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Top Campaigns -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Campaigns</CardTitle>
              <CardDescription>Campaigns by total raised</CardDescription>
            </div>
            <NuxtLink to="/admin/campaigns/standard">
              <Button variant="outline" size="sm">
                View all
                <ArrowRight class="ml-1 h-4 w-4" />
              </Button>
            </NuxtLink>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <NuxtLink
                v-for="campaign in topCampaigns"
                :key="campaign.id"
                :to="`/admin/campaigns/${campaign.id}`"
                class="flex items-center justify-between gap-2 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors"
              >
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm font-medium truncate">{{ campaign.name }}</span>
                    <StatusBadge :status="campaign.status" class="text-xs" />
                  </div>
                  <p class="text-xs text-muted-foreground">
                    {{ campaign.stats.totalDonors }} donors &middot;
                    {{ campaign.stats.totalDonations }} donations
                  </p>
                </div>
                <span class="text-sm font-medium shrink-0">
                  {{ formatCurrency(campaign.stats.totalRaised, campaign.stats.currency, 0) }}
                </span>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
