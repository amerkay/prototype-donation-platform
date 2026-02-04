<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { transactionColumnsCompact } from '~/features/donor-portal/columns/transactionColumns'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, CreditCard, DollarSign, Megaphone, Receipt } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const { formatAmount, getProgressPercentage } = useCampaignFormatters()

const { transactions, activeSubscriptions, activeFundraisers, totalDonated, totalTransactions } =
  useDonorPortal()

const recentTransactions = computed(() => transactions.value.slice(0, 5))
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="[{ label: 'Dashboard' }]" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <!-- Page header -->
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Overview of your donation activity</p>
      </div>

      <!-- Stats row -->
      <div class="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader class="flex-row items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <DollarSign class="size-5 text-muted-foreground" />
            </div>
            <div class="space-y-0.5">
              <CardDescription class="text-sm">Total Donated</CardDescription>
              <CardTitle class="text-2xl">{{ formatAmount(totalDonated) }}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="flex-row items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Receipt class="size-5 text-muted-foreground" />
            </div>
            <div class="space-y-0.5">
              <CardDescription class="text-sm">Transactions</CardDescription>
              <CardTitle class="text-2xl">{{ totalTransactions }}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="flex-row items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <CreditCard class="size-5 text-muted-foreground" />
            </div>
            <div class="space-y-0.5">
              <CardDescription class="text-sm">Subscriptions</CardDescription>
              <CardTitle class="text-2xl">{{ activeSubscriptions.length }}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="flex-row items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Megaphone class="size-5 text-muted-foreground" />
            </div>
            <div class="space-y-0.5">
              <CardDescription class="text-sm">Fundraisers</CardDescription>
              <CardTitle class="text-2xl">{{ activeFundraisers.length }}</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Recent Transactions -->
        <Card class="lg:col-span-2 overflow-hidden">
          <CardHeader>
            <div class="flex items-center gap-2">
              <Receipt class="w-4 h-4 text-muted-foreground" />
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
                View all donations <ArrowRight class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- Active Subscriptions -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <CreditCard class="w-4 h-4 text-muted-foreground" />
              <CardTitle class="text-base font-semibold">Subscriptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-0 space-y-2">
            <div
              v-for="sub in activeSubscriptions.slice(0, 3)"
              :key="sub.id"
              class="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
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
                View all subscriptions <ArrowRight class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>

        <!-- My Fundraisers -->
        <Card>
          <CardHeader>
            <div class="flex items-center gap-2">
              <Megaphone class="w-4 h-4 text-muted-foreground" />
              <CardTitle class="text-base font-semibold">My Fundraisers</CardTitle>
            </div>
          </CardHeader>
          <CardContent class="pt-0 space-y-2">
            <NuxtLink
              v-for="f in activeFundraisers.slice(0, 3)"
              :key="f.id"
              :to="`/portal/fundraisers/${f.id}`"
              class="block"
            >
              <div
                class="rounded-md border p-3 space-y-2 hover:border-primary/40 transition-colors"
              >
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
            <p
              v-if="activeFundraisers.length === 0"
              class="py-4 text-center text-sm text-muted-foreground"
            >
              No active fundraisers.
            </p>
          </CardContent>
          <CardFooter>
            <NuxtLink to="/portal/fundraisers" class="w-full md:max-w-xs">
              <Button variant="outline" size="sm" class="w-full">
                View all fundraisers <ArrowRight class="w-3.5 h-3.5" />
              </Button>
            </NuxtLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>
