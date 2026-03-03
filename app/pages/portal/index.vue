<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import type { Campaign } from '~/features/campaigns/shared/types'
import DataTable from '~/features/_shared/components/DataTable.vue'
import { transactionColumnsCompact } from '~/features/donor-portal/columns/transactionColumns'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import StatsCard from '@/components/StatsCard.vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ICON_FORWARD,
  ICON_SUBSCRIPTION,
  ICON_MONEY,
  ICON_CAMPAIGN,
  ICON_RECEIPT
} from '~/lib/icons'

definePageMeta({
  layout: 'portal'
})

const { formatAmount, getProgressPercentage } = useCampaignFormatters()

const {
  transactions,
  activeSubscriptions,
  activeFundraisers,
  totalDonated,
  hasMultiCurrencyDonations,
  totalTransactions
} = useDonorPortal()

const totalDonatedLabel = computed(() => {
  const formatted = formatAmount(totalDonated.value)
  return hasMultiCurrencyDonations.value ? `≈ ${formatted}` : formatted
})

const { getCampaignById } = useCampaigns()

const recentTransactions = computed(() => transactions.value.slice(0, 5))

// Merge parent template fields (matchedGiving, form, etc.) into fundraiser campaigns
const mergedFundraisers = computed(() =>
  activeFundraisers.value
    .map((f) => getCampaignById(f.id))
    .filter((f): f is Campaign => f != null)
)

/** Include matched giving poolDrawn in the raised amount (mirrors CampaignProgress logic) */
function getEffectiveRaised(f: Campaign) {
  const poolDrawn = (f.matchedGiving?.periods ?? []).reduce((sum, p) => sum + p.poolDrawn, 0)
  return f.stats.totalRaised + poolDrawn
}
</script>

<template>
  <div>
    <BreadcrumbBar :items="[{ label: 'Dashboard' }]" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <!-- Page header -->
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Your giving at a glance</p>
      </div>

      <!-- Stats row -->
      <div class="grid gap-6 grid-cols-2 md:grid-cols-4">
        <StatsCard :icon="ICON_MONEY" label="Total Donated" :value="totalDonatedLabel" />
        <StatsCard :icon="ICON_RECEIPT" label="Transactions" :value="totalTransactions" />
        <StatsCard
          :icon="ICON_SUBSCRIPTION"
          label="Subscriptions"
          :value="activeSubscriptions.length"
        />
        <StatsCard :icon="ICON_CAMPAIGN" label="Fundraisers" :value="mergedFundraisers.length" />
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <!-- Recent Transactions -->
        <Card class="md:col-span-2 lg:col-span-3 overflow-hidden">
          <CardHeader>
            <div class="flex items-center gap-2">
              <ICON_RECEIPT class="w-4 h-4 text-muted-foreground" />
              <CardTitle class="text-base font-semibold">Recent Transactions</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <DataTable
              :columns="transactionColumnsCompact"
              :data="recentTransactions"
              :page-size="5"
              :show-pagination="false"
            />
          </CardContent>
          <CardFooter>
            <NuxtLink to="/portal/donations" class="w-full md:max-w-xs">
              <Button variant="outline" size="sm" class="w-full">
                View all donations <ICON_FORWARD class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- Active Subscriptions -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <ICON_SUBSCRIPTION class="w-4 h-4 text-muted-foreground" />
              <CardTitle class="text-base font-semibold">
                Subscriptions
                <span class="text-muted-foreground font-normal"
                  >({{ activeSubscriptions.length }} active)</span
                >
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-0 space-y-2">
            <NuxtLink
              v-for="sub in activeSubscriptions.slice(0, 3)"
              :key="sub.id"
              :to="`/portal/subscriptions/${sub.id}`"
              class="block"
            >
              <div
                class="flex items-center justify-between rounded-md border p-3 hover:border-primary/40 transition-colors"
              >
                <div class="space-y-0.5">
                  <p class="text-sm font-medium leading-none">
                    {{ sub.lineItems.map((i) => i.productTitle).join(', ') }}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {{ formatAmount(sub.totalAmount, sub.currency) }}/{{ sub.frequency }}
                  </p>
                </div>
                <StatusBadge :status="sub.status" />
              </div>
            </NuxtLink>
            <p
              v-if="activeSubscriptions.length === 0"
              class="py-4 text-center text-sm text-muted-foreground"
            >
              No active subscriptions.
            </p>
          </CardContent>
          <CardFooter>
            <NuxtLink to="/portal/subscriptions" class="w-full md:max-w-xs">
              <Button variant="outline" size="sm" class="w-full">
                View all subscriptions <ICON_FORWARD class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- My Fundraisers -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <ICON_CAMPAIGN class="w-4 h-4 text-muted-foreground" />
              <CardTitle class="text-base font-semibold">
                My Fundraisers
                <span class="text-muted-foreground font-normal"
                  >({{ mergedFundraisers.length }} active)</span
                >
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-0 space-y-2">
            <NuxtLink
              v-for="f in mergedFundraisers.slice(0, 3)"
              :key="f.id"
              :to="`/portal/fundraisers/${f.id}`"
              class="block"
            >
              <div
                class="rounded-md border p-3 space-y-2 hover:border-primary/40 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <p class="text-sm font-medium leading-none truncate">{{ f.name }}</p>
                  <StatusBadge :status="f.status" />
                </div>
                <div v-if="f.crowdfunding.goalAmount" class="space-y-1">
                  <Progress
                    :model-value="
                      getProgressPercentage(getEffectiveRaised(f), f.crowdfunding.goalAmount)
                    "
                    class="h-1.5"
                  />
                  <div class="flex justify-between text-xs text-muted-foreground">
                    <span>{{ formatAmount(getEffectiveRaised(f), f.stats.currency) }}</span>
                    <span>{{ formatAmount(f.crowdfunding.goalAmount) }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
            <p
              v-if="mergedFundraisers.length === 0"
              class="py-4 text-center text-sm text-muted-foreground"
            >
              No active fundraisers.
            </p>
          </CardContent>
          <CardFooter>
            <NuxtLink to="/portal/fundraisers" class="w-full md:max-w-xs">
              <Button variant="outline" size="sm" class="w-full">
                View all fundraisers <ICON_FORWARD class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
