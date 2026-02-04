<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { transactionColumnsCompact } from '~/features/donor-portal/columns/transactionColumns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Receipt, CreditCard, Megaphone } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const { formatAmount, getProgressPercentage } = useCampaignFormatters()

const { transactions, activeSubscriptions, activeFundraisers, totalDonated, totalTransactions } =
  useDonorPortal()

const recentTransactions = computed(() => transactions.value.slice(0, 5))
</script>

<template>
  <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
    <!-- Stats row -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 py-4">
      <Card>
        <CardHeader class="p-4 pb-2">
          <CardDescription class="text-xs">Total Donated</CardDescription>
          <CardTitle class="text-xl">{{ formatAmount(totalDonated) }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="p-4 pb-2">
          <CardDescription class="text-xs">Transactions</CardDescription>
          <CardTitle class="text-xl">{{ totalTransactions }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="p-4 pb-2">
          <CardDescription class="text-xs">Subscriptions</CardDescription>
          <CardTitle class="text-xl">{{ activeSubscriptions.length }}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader class="p-4 pb-2">
          <CardDescription class="text-xs">Fundraisers</CardDescription>
          <CardTitle class="text-xl">{{ activeFundraisers.length }}</CardTitle>
        </CardHeader>
      </Card>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Recent Transactions -->
      <Card class="lg:col-span-2">
        <CardHeader class="p-4 pb-0 flex-row items-center justify-between">
          <div class="flex items-center gap-2">
            <Receipt class="w-4 h-4 text-muted-foreground" />
            <CardTitle class="text-sm font-medium">Recent Transactions</CardTitle>
          </div>
          <NuxtLink to="/portal/donations">
            <Button variant="ghost" size="sm">
              View all <ArrowRight class="w-3.5 h-3.5 ml-1" />
            </Button>
          </NuxtLink>
        </CardHeader>
        <CardContent class="p-4 pt-2">
          <DataTable
            :columns="transactionColumnsCompact"
            :data="recentTransactions"
            :page-size="5"
            :show-pagination="false"
          />
        </CardContent>
      </Card>

      <!-- Active Subscriptions -->
      <Card>
        <CardHeader class="p-4 pb-0 flex-row items-center justify-between">
          <div class="flex items-center gap-2">
            <CreditCard class="w-4 h-4 text-muted-foreground" />
            <CardTitle class="text-sm font-medium">Subscriptions</CardTitle>
          </div>
          <NuxtLink to="/portal/subscriptions">
            <Button variant="ghost" size="sm">
              View all <ArrowRight class="w-3.5 h-3.5 ml-1" />
            </Button>
          </NuxtLink>
        </CardHeader>
        <CardContent class="p-4 pt-2 space-y-2">
          <div
            v-for="sub in activeSubscriptions.slice(0, 3)"
            :key="sub.id"
            class="flex items-center justify-between rounded-md border p-3"
          >
            <div class="space-y-0.5">
              <p class="text-sm font-medium leading-none">
                {{ sub.lineItems.map((i) => i.productIcon).join(' ') }}
                {{ sub.lineItems.map((i) => i.productName).join(', ') }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ formatAmount(sub.amount) }}/{{ sub.frequency }}
              </p>
            </div>
            <Badge
              variant="outline"
              :data-campaign-status="sub.status"
              class="border-(--cs-border) text-(--cs-text)"
            >
              <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
              {{ sub.status }}
            </Badge>
          </div>
          <p v-if="activeSubscriptions.length === 0" class="text-sm text-muted-foreground py-2">
            No active subscriptions.
          </p>
        </CardContent>
      </Card>

      <!-- My Fundraisers -->
      <Card>
        <CardHeader class="p-4 pb-0 flex-row items-center justify-between">
          <div class="flex items-center gap-2">
            <Megaphone class="w-4 h-4 text-muted-foreground" />
            <CardTitle class="text-sm font-medium">My Fundraisers</CardTitle>
          </div>
          <NuxtLink to="/portal/fundraisers">
            <Button variant="ghost" size="sm">
              View all <ArrowRight class="w-3.5 h-3.5 ml-1" />
            </Button>
          </NuxtLink>
        </CardHeader>
        <CardContent class="p-4 pt-2 space-y-2">
          <NuxtLink
            v-for="f in activeFundraisers.slice(0, 3)"
            :key="f.id"
            :to="`/portal/fundraisers/${f.id}`"
            class="block"
          >
            <div class="rounded-md border p-3 space-y-2 hover:border-primary/40 transition-colors">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium leading-none truncate">{{ f.name }}</p>
                <Badge
                  variant="outline"
                  :data-campaign-status="f.status"
                  class="border-(--cs-border) text-(--cs-text)"
                >
                  <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
                  {{ f.status }}
                </Badge>
              </div>
              <div v-if="f.crowdfunding.goalAmount" class="space-y-1">
                <Progress
                  :model-value="
                    getProgressPercentage(f.stats.totalRaised, f.crowdfunding.goalAmount)
                  "
                  class="h-1.5"
                />
                <div class="flex justify-between text-xs text-muted-foreground">
                  <span>{{ formatAmount(f.stats.totalRaised) }}</span>
                  <span>{{ formatAmount(f.crowdfunding.goalAmount) }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
          <p v-if="activeFundraisers.length === 0" class="text-sm text-muted-foreground py-2">
            No active fundraisers.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
