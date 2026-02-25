<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import DonorInfoCard from '~/features/_admin/components/DonorInfoCard.vue'
import LineItemsCard from '~/features/_admin/components/LineItemsCard.vue'
import CustomFieldsCard from '~/features/_admin/components/CustomFieldsCard.vue'
import TransactionHistoryCard from '~/features/_admin/components/TransactionHistoryCard.vue'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { useSubscriptionActions } from '~/features/subscriptions/shared/composables/useSubscriptionActions'
import SubscriptionActionDialogs from '~/features/subscriptions/shared/components/SubscriptionActionDialogs.vue'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Pause, Play, X, DollarSign, RefreshCw, Wallet } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { subscriptions, getSubscriptionById, getSubscriptionPayments } = useAdminSubscriptions()

const sub = computed(() => getSubscriptionById(route.params.id as string))
const payments = computed(() => getSubscriptionPayments(route.params.id as string))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  {
    label: sub.value
      ? `${sub.value.donorName ?? 'Unknown'} — ${formatCurrency(sub.value.amount, sub.value.currency)}/${sub.value.frequency}`
      : 'Not Found'
  }
])

const avgPayment = computed(() => {
  if (!sub.value || sub.value.paymentCount === 0) return 0
  return sub.value.totalPaid / sub.value.paymentCount
})

const totalCoverCosts = computed(() =>
  payments.value.reduce((sum, p) => sum + (p.coverCostsAmount ?? 0), 0)
)

const totalSubtotal = computed(() => payments.value.reduce((sum, p) => sum + p.subtotal, 0))

const aggregatedCustomFields = computed(() => {
  const fields: Record<string, string> = {}
  for (const payment of payments.value) {
    if (payment.customFields) {
      Object.assign(fields, payment.customFields)
    }
  }
  return fields
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

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!sub" class="py-12 text-center">
        <p class="text-muted-foreground">Subscription not found.</p>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">
                {{ sub.donorName ?? 'Unknown' }} — {{ formatCurrency(sub.amount, sub.currency) }}/{{
                  sub.frequency
                }}
              </h1>
              <StatusBadge :status="sub.status" />
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              v-if="sub.status === 'paused'"
              variant="outline"
              size="sm"
              @click="handleResume(sub.id)"
            >
              <Play class="size-4 mr-1.5" />
              Resume
            </Button>
            <Button
              v-if="sub.status === 'active'"
              variant="outline"
              size="sm"
              @click="confirmPause(sub.id)"
            >
              <Pause class="size-4 mr-1.5" />
              Pause
            </Button>
            <Button
              v-if="sub.status === 'active'"
              variant="outline"
              size="sm"
              @click="openChangeAmount(sub.id)"
            >
              <DollarSign class="size-4 mr-1.5" />
              Change Amount
            </Button>
            <Button
              v-if="sub.status === 'active' || sub.status === 'paused'"
              variant="outline"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="confirmCancel(sub.id)"
            >
              <X class="size-4 mr-1.5" />
              Cancel
            </Button>
          </div>
        </div>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Donor -->
          <DonorInfoCard
            :donor-id="sub.donorId ?? ''"
            :donor-name="sub.donorName ?? 'Unknown'"
            :donor-email="sub.donorEmail ?? ''"
            :linkable="true"
          />

          <!-- Subscription Details -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <RefreshCw class="h-4 w-4" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Charity" :value="sub.charityName" />
              <AdminDetailRow label="Frequency">
                <span class="capitalize">{{ sub.frequency }}</span>
              </AdminDetailRow>
              <AdminDetailRow
                label="Amount"
                :value="formatCurrency(sub.amount, sub.currency)"
                value-class="font-medium"
              />
              <Separator />
              <AdminDetailRow label="Payment">
                <span class="capitalize">{{ paymentMethodLabel(sub.paymentMethod) }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Processor">
                <span class="capitalize">{{ sub.processor }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Subscription ID">
                <span class="font-mono text-xs">{{ sub.processorSubscriptionId }}</span>
              </AdminDetailRow>
              <Separator />
              <AdminDetailRow label="Created" :value="formatDate(sub.createdAt)" />
              <AdminDetailRow
                v-if="sub.nextBillingDate"
                label="Next Billing"
                :value="formatDate(sub.nextBillingDate)"
              />
              <AdminDetailRow v-if="sub.cancelledAt" label="Cancelled">
                <span class="text-destructive">{{ formatDate(sub.cancelledAt) }}</span>
              </AdminDetailRow>
              <AdminDetailRow v-if="sub.pausedAt" label="Paused">
                <span class="text-amber-600">{{ formatDate(sub.pausedAt) }}</span>
              </AdminDetailRow>
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
              <AdminDetailRow
                label="Lifetime Subtotal"
                :value="formatCurrency(totalSubtotal, sub.currency)"
              />
              <AdminDetailRow
                v-if="totalCoverCosts > 0"
                label="Lifetime Cover Costs"
                :value="formatCurrency(totalCoverCosts, sub.currency)"
              />
              <AdminDetailRow
                label="Lifetime Total"
                :value="formatCurrency(sub.totalPaid, sub.currency)"
                value-class="font-medium"
              />
              <Separator />
              <AdminDetailRow label="Payment Count" :value="String(sub.paymentCount)" />
              <AdminDetailRow
                label="Average Payment"
                :value="formatCurrency(avgPayment, sub.currency)"
              />
              <div
                v-if="sub.exchangeRate !== 1"
                class="flex justify-between text-xs text-muted-foreground"
              >
                <span>Exchange Rate</span>
                <span>1 {{ sub.currency }} = {{ sub.exchangeRate }} {{ sub.baseCurrency }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Custom Fields -->
          <CustomFieldsCard
            v-if="Object.keys(aggregatedCustomFields).length"
            :custom-fields="aggregatedCustomFields"
          />

          <!-- Order Details (full width) -->
          <LineItemsCard
            :line-items="sub.lineItems"
            :currency="sub.currency"
            title="Order Details"
            :campaign-name="sub.campaignName"
            :campaign-link="`/admin/campaigns/${sub.campaignId}`"
            class="md:col-span-2 lg:col-span-3"
          />
        </div>

        <!-- Payment History -->
        <TransactionHistoryCard :data="payments" title="Payment History" class="mt-6" />
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
