<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import { useSubscriptionActions } from '~/features/subscriptions/shared/composables/useSubscriptionActions'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import PortalLineItemsCard from '~/features/donor-portal/components/PortalLineItemsCard.vue'
import PortalDetailRow from '~/features/donor-portal/components/PortalDetailRow.vue'
import SubscriptionActionDialogs from '~/features/subscriptions/shared/components/SubscriptionActionDialogs.vue'
import DataTable from '~/features/_shared/components/DataTable.vue'
import { subscriptionPaymentColumns } from '~/features/donor-portal/columns/subscriptionPaymentColumns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Wallet, History, Pause, Play, X, DollarSign } from 'lucide-vue-next'

definePageMeta({ layout: 'portal' })

const route = useRoute()
const { subscriptions, transactions } = useDonorPortal()
const { formatAmount, formatDate } = useCampaignFormatters()
const { checkEligibility } = useActionEligibility()
const { campaigns } = useCampaigns()

const sub = computed(() => subscriptions.value.find((s) => s.id === route.params.id))

// Resolve minimum amount from the subscription's campaign default form, per frequency.
// Returns null if no form can be found — button is hidden in that case.
const changeAmountMin = computed((): number | null => {
  if (!sub.value) return null
  const campaign = campaigns.value.find((c) => c.id === sub.value!.campaignId)
  const defaultForm = campaign?.forms.find((f) => f.isDefault)
  const freq = sub.value.frequency as 'monthly' | 'yearly'
  return defaultForm?.config.donationAmounts.frequencies[freq]?.customAmount.min ?? null
})

const payments = computed(() =>
  transactions.value
    .filter((t) => t.subscriptionId === route.params.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
)

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/portal' },
  { label: 'Subscriptions', href: '/portal/subscriptions' },
  { label: sub.value?.campaignName ?? 'Not Found' }
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
  if (!sub.value) return { canPause: false, canCancel: false, canRefund: false, canChangeAmount: false }
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
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-semibold tracking-tight">
                {{ sub.campaignName }} — {{ formatAmount(sub.amount, sub.currency) }}/{{
                  sub.frequency
                }}
              </h1>
              <StatusBadge :status="sub.status" />
            </div>
            <p class="text-sm text-muted-foreground">
              {{ sub.charityName }} · Created {{ formatDate(sub.createdAt) }}
            </p>
          </div>
          <div
            v-if="sub.status === 'active' || sub.status === 'paused'"
            class="flex flex-wrap items-center gap-2"
          >
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
              v-if="sub.status === 'active' && eligibility.canChangeAmount && changeAmountMin !== null"
              variant="outline"
              size="sm"
              @click="openChangeAmount(sub.id, changeAmountMin!)"
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
        </div>

        <!-- Detail Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Subscription -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <RefreshCw class="h-4 w-4" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <PortalDetailRow label="Campaign">
                <span class="font-medium">{{ sub.campaignName }}</span>
              </PortalDetailRow>
              <PortalDetailRow label="Charity" :value="sub.charityName" />
              <PortalDetailRow label="Frequency">
                <span class="capitalize">{{ sub.frequency }}</span>
              </PortalDetailRow>
              <PortalDetailRow label="Amount">
                <span class="font-medium">{{ formatAmount(sub.amount, sub.currency) }}</span>
              </PortalDetailRow>
              <Separator />
              <PortalDetailRow label="Payment" :value="paymentMethodLabel" />
              <PortalDetailRow label="Processor">
                <span class="capitalize">{{ sub.processor }}</span>
              </PortalDetailRow>
              <Separator />
              <PortalDetailRow label="Created" :value="formatDate(sub.createdAt)" />
              <PortalDetailRow
                v-if="sub.nextBillingDate"
                label="Next Billing"
                :value="formatDate(sub.nextBillingDate)"
              />
              <PortalDetailRow v-if="sub.cancelledAt" label="Cancelled">
                <span class="text-destructive">{{ formatDate(sub.cancelledAt) }}</span>
              </PortalDetailRow>
              <PortalDetailRow v-if="sub.pausedAt" label="Paused">
                <span class="text-amber-600">{{ formatDate(sub.pausedAt) }}</span>
              </PortalDetailRow>
            </CardContent>
          </Card>

          <!-- Financials -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <Wallet class="h-4 w-4" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <PortalDetailRow label="Total Paid">
                <span class="font-medium">{{ formatAmount(sub.totalPaid, sub.currency) }}</span>
              </PortalDetailRow>
              <PortalDetailRow label="Payment Count" :value="String(sub.paymentCount)" />
              <PortalDetailRow
                label="Average Payment"
                :value="formatAmount(avgPayment, sub.currency)"
              />
            </CardContent>
          </Card>

          <!-- Order Details -->
          <PortalLineItemsCard
            :line-items="sub.lineItems"
            :currency="sub.currency"
            :campaign-name="sub.campaignName"
          />

          <!-- Payment History -->
          <Card v-if="payments.length">
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <History class="h-4 w-4" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                :columns="subscriptionPaymentColumns"
                :data="payments"
                :show-pagination="payments.length > 10"
                :page-size="10"
              />
            </CardContent>
          </Card>
        </div>
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
