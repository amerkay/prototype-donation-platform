<script setup lang="ts">
import type { SubscriptionStatus, Subscription } from '~/features/subscriptions/shared/types'
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { CreditCard } from 'lucide-vue-next'
import SubscriptionCard from '~/features/subscriptions/donor/components/SubscriptionCard.vue'
import { useSubscriptionActions } from '~/features/subscriptions/shared/composables/useSubscriptionActions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import BaseDialogOrDrawer from '@/components/BaseDialogOrDrawer.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({
  layout: 'portal'
})

const { formatDate } = useCampaignFormatters()
const { subscriptions } = useDonorPortal()

const statusFilters: { value: SubscriptionStatus | 'all'; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'all', label: 'All' }
]

const activeFilter = ref<SubscriptionStatus | 'all'>('active')
const filteredSubscriptions = ref<Subscription[]>([])

const applyFilter = () => {
  filteredSubscriptions.value =
    activeFilter.value === 'all'
      ? [...subscriptions.value]
      : subscriptions.value.filter((s) => s.status === activeFilter.value)
}

const setFilter = (status: SubscriptionStatus | 'all') => {
  activeFilter.value = status
  applyFilter()
}

onMounted(() => {
  applyFilter()
})

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
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="filter in statusFilters"
          :key="filter.value"
          :variant="activeFilter === filter.value ? 'default' : 'outline'"
          size="sm"
          @click="setFilter(filter.value)"
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
              @pause="confirmPause"
              @resume="handleResume"
              @cancel="confirmCancel"
              @change-amount="openChangeAmount"
            />
          </div>
        </section>
      </div>
    </div>

    <!-- Pause Confirmation -->
    <AlertDialog v-model:open="showPauseDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Pause subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            Your subscription will be paused and you won't be charged until you resume it. You can
            resume at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handlePause">Pause Subscription</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Cancel Confirmation -->
    <AlertDialog v-model:open="showCancelDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your subscription will be cancelled and you won't be
            charged again. You can always start a new subscription later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction @click="handleCancel">Cancel Subscription</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Change Amount Dialog -->
    <BaseDialogOrDrawer v-model:open="changeAmountState.open" max-width="sm:max-w-md">
      <template #header>Change Subscription Amount</template>
      <template #content>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="new-amount">New Amount</Label>
            <div class="flex gap-2 items-center">
              <span class="text-sm text-muted-foreground">{{
                currentSubscription?.currency || '£'
              }}</span>
              <Input
                id="new-amount"
                v-model="changeAmountState.newAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
              <span class="text-sm text-muted-foreground"
                >/{{ currentSubscription?.frequency }}</span
              >
            </div>
          </div>
          <p class="text-sm text-muted-foreground">
            The new amount will take effect on your next billing date:
            {{
              currentSubscription?.nextBillingDate
                ? formatDate(currentSubscription.nextBillingDate)
                : 'N/A'
            }}
          </p>
        </div>
      </template>
      <template #footer>
        <Button variant="outline" @click="changeAmountState.open = false">Cancel</Button>
        <Button @click="handleChangeAmount">Update Amount</Button>
      </template>
    </BaseDialogOrDrawer>
  </div>
</template>
