<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import { useSubscriptionActions } from '~/features/subscriptions/shared/composables/useSubscriptionActions'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import PortalLineItemsCard from '~/features/donor-portal/components/PortalLineItemsCard.vue'
import PortalDonorCard from '~/features/donor-portal/components/PortalDonorCard.vue'
import SubscriptionActionDialogs from '~/features/subscriptions/shared/components/SubscriptionActionDialogs.vue'
import { formatCurrency } from '~/lib/formatCurrency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Pause, Play, X, DollarSign } from 'lucide-vue-next'

definePageMeta({ layout: 'portal' })

const route = useRoute()
const { subscriptions, transactions } = useDonorPortal()
const { formatAmount, formatDate } = useCampaignFormatters()
const { checkEligibility } = useActionEligibility()

const sub = computed(() => subscriptions.value.find((s) => s.id === route.params.id))

const payments = computed(() =>
  transactions.value
    .filter((t) => t.subscriptionId === route.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/portal' },
  { label: 'Subscriptions', href: '/portal/subscriptions' },
  {
    label: sub.value
      ? `${formatCurrency(sub.value.amount, sub.value.currency)}/${sub.value.frequency}`
      : 'Not Found'
  }
])

const avgPayment = computed(() => {
  if (!sub.value || sub.value.paymentCount === 0) return 0
  return sub.value.totalPaid / sub.value.paymentCount
})

const donorValueLastYear = computed(() => {
  if (!sub.value) return 0
  const oneYearAgo = Date.now() - 365.25 * 24 * 60 * 60 * 1000
  return transactions.value
    .filter(
      (t) =>
        t.status === 'succeeded' &&
        t.charityName === sub.value!.charityName &&
        new Date(t.createdAt).getTime() >= oneYearAgo
    )
    .reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
})

const eligibility = computed(() => {
  if (!sub.value) return { canPause: false, canCancel: false, canRefund: false }
  return checkEligibility({
    subscription: sub.value,
    donorValueLastYear: donorValueLastYear.value
  })
})

const paymentMethodLabel = computed(() => {
  if (!sub.value) return ''
  const pm = sub.value.paymentMethod
  if (pm.type === 'card' && pm.brand && pm.last4) return `${pm.brand} ****${pm.last4}`
  if (pm.type === 'paypal') return 'PayPal'
  if (pm.type === 'bank_transfer') return 'Bank Transfer'
  return pm.type
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
    <BreadcrumbBar :items="breadcrumbs" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div v-if="!sub" class="text-center py-12 text-muted-foreground">Subscription not found.</div>

      <template v-else>
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight">
              {{ formatAmount(sub.amount, sub.currency) }}/{{ sub.frequency }}
            </h1>
            <p class="text-sm text-muted-foreground">Created {{ formatDate(sub.createdAt) }}</p>
          </div>
          <StatusBadge :status="sub.status" />
        </div>

        <!-- Detail Cards Grid -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- Subscription -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Subscription</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Campaign</span>
                <span class="font-medium">{{ sub.campaignName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Charity</span>
                <span>{{ sub.charityName }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Frequency</span>
                <span class="capitalize">{{ sub.frequency }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Amount</span>
                <span class="font-medium">{{ formatAmount(sub.amount, sub.currency) }}</span>
              </div>
              <Separator />
              <div class="flex justify-between">
                <span class="text-muted-foreground">Payment</span>
                <span>{{ paymentMethodLabel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Processor</span>
                <span class="capitalize">{{ sub.processor }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Timeline -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Created</span>
                <span>{{ formatDate(sub.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Current Period</span>
                <span
                  >{{ formatDate(sub.currentPeriodStart) }} —
                  {{ formatDate(sub.currentPeriodEnd) }}</span
                >
              </div>
              <div v-if="sub.nextBillingDate" class="flex justify-between">
                <span class="text-muted-foreground">Next Billing</span>
                <span>{{ formatDate(sub.nextBillingDate) }}</span>
              </div>
              <div v-if="sub.cancelledAt" class="flex justify-between">
                <span class="text-muted-foreground">Cancelled</span>
                <span class="text-destructive">{{ formatDate(sub.cancelledAt) }}</span>
              </div>
              <div v-if="sub.pausedAt" class="flex justify-between">
                <span class="text-muted-foreground">Paused</span>
                <span class="text-amber-600">{{ formatDate(sub.pausedAt) }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Financials -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Financials</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Total Paid</span>
                <span class="font-medium">{{ formatAmount(sub.totalPaid, sub.currency) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Payment Count</span>
                <span>{{ sub.paymentCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Average Payment</span>
                <span>{{ formatAmount(avgPayment, sub.currency) }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Line Items -->
          <PortalLineItemsCard :line-items="sub.lineItems" :currency="sub.currency" />

          <!-- Donor Info -->
          <PortalDonorCard
            :donor-name="sub.donorName ?? 'Unknown'"
            :donor-email="sub.donorEmail ?? ''"
          />
        </div>

        <!-- Action Buttons -->
        <div v-if="sub.status === 'active' || sub.status === 'paused'" class="flex flex-wrap gap-2">
          <Button
            v-if="sub.status === 'paused'"
            variant="outline"
            size="sm"
            @click="handleResume(sub.id)"
          >
            <Play class="size-4 mr-1.5" /> Resume
          </Button>
          <Button
            v-if="sub.status === 'active' && eligibility.canPause"
            variant="outline"
            size="sm"
            @click="confirmPause(sub.id)"
          >
            <Pause class="size-4 mr-1.5" /> Pause
          </Button>
          <Button
            v-if="sub.status === 'active'"
            variant="outline"
            size="sm"
            @click="openChangeAmount(sub.id)"
          >
            <DollarSign class="size-4 mr-1.5" /> Change Amount
          </Button>
          <Button
            v-if="(sub.status === 'active' || sub.status === 'paused') && eligibility.canCancel"
            variant="outline"
            size="sm"
            class="text-destructive hover:text-destructive"
            @click="confirmCancel(sub.id)"
          >
            <X class="size-4 mr-1.5" /> Cancel
          </Button>
        </div>

        <!-- Payment History -->
        <Card v-if="payments.length">
          <CardHeader>
            <CardTitle class="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <NuxtLink
                v-for="payment in payments"
                :key="payment.id"
                :to="`/portal/donations/${payment.id}`"
                class="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <span>{{ formatDate(payment.createdAt) }}</span>
                  <StatusBadge :status="payment.status" />
                </div>
                <span class="font-medium">{{
                  formatAmount(payment.totalAmount, payment.currency)
                }}</span>
              </NuxtLink>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>

    <SubscriptionActionDialogs
      v-model:show-pause-dialog="showPauseDialog"
      v-model:show-cancel-dialog="showCancelDialog"
      :change-amount-state="changeAmountState"
      :current-subscription="currentSubscription"
      @update:change-amount-state="Object.assign(changeAmountState, $event)"
      @pause="handlePause"
      @cancel="handleCancel"
      @change-amount="handleChangeAmount"
    />
  </div>
</template>
