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
import { getAvgPayment } from '~/features/subscriptions/shared/utils'
import { aggregateCustomFields } from '~/features/_shared/utils/aggregateCustomFields'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ICON_PAUSE,
  ICON_RESUME,
  ICON_MONEY,
  ICON_WALLET,
  ICON_TERMINAL_STOP,
  ICON_SUBSCRIPTION
} from '~/lib/icons'

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
      ? `${sub.value.donorName ?? 'Unknown'} — ${formatCurrency(sub.value.totalAmount, sub.value.currency)}/${sub.value.frequency}`
      : 'Not Found'
  }
])

const avgPayment = computed(() => (sub.value ? getAvgPayment(sub.value) : 0))

const totalCoverCosts = computed(() =>
  payments.value.reduce((sum, p) => sum + (p.coverCostsAmount ?? 0), 0)
)

const totalSubtotal = computed(() => payments.value.reduce((sum, p) => sum + p.subtotal, 0))

const aggregatedCustomFields = computed(() => aggregateCustomFields(payments.value))

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
                {{ sub.donorName ?? 'Unknown' }} —
                {{ formatCurrency(sub.totalAmount, sub.currency) }}/{{ sub.frequency }}
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
              <ICON_RESUME class="size-4 mr-1.5" />
              Resume
            </Button>
            <Button
              v-if="sub.status === 'active'"
              variant="outline"
              size="sm"
              @click="confirmPause(sub.id)"
            >
              <ICON_PAUSE class="size-4 mr-1.5" />
              Pause
            </Button>
            <Button
              v-if="sub.status === 'active'"
              variant="outline"
              size="sm"
              @click="openChangeAmount(sub.id)"
            >
              <ICON_MONEY class="size-4 mr-1.5" />
              Change Amount
            </Button>
            <Button
              v-if="sub.status === 'active' || sub.status === 'paused'"
              variant="outline"
              size="sm"
              class="text-destructive hover:text-destructive"
              @click="confirmCancel(sub.id)"
            >
              <ICON_TERMINAL_STOP class="size-4 mr-1.5" />
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
                <ICON_SUBSCRIPTION class="h-4 w-4" />
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
                :value="formatCurrency(sub.totalAmount, sub.currency)"
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
                <ICON_WALLET class="h-4 w-4" />
                Financials
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Lifetime Subtotal">
                <span>{{ formatCurrency(totalSubtotal, sub.currency) }}</span>
                <span v-if="sub.exchangeRate !== 1" class="text-xs text-muted-foreground ml-1">
                  (≈ {{ formatCurrency(totalSubtotal * sub.exchangeRate, sub.baseCurrency) }})
                </span>
              </AdminDetailRow>
              <AdminDetailRow v-if="totalCoverCosts > 0" label="Lifetime Cover Costs">
                <span>{{ formatCurrency(totalCoverCosts, sub.currency) }}</span>
                <span v-if="sub.exchangeRate !== 1" class="text-xs text-muted-foreground ml-1">
                  (≈ {{ formatCurrency(totalCoverCosts * sub.exchangeRate, sub.baseCurrency) }})
                </span>
              </AdminDetailRow>
              <AdminDetailRow label="Lifetime Total" value-class="font-medium">
                <span class="font-medium">{{ formatCurrency(sub.totalPaid, sub.currency) }}</span>
                <span
                  v-if="sub.exchangeRate !== 1"
                  class="text-xs text-muted-foreground ml-1 font-normal"
                >
                  (≈ {{ formatCurrency(sub.totalPaid * sub.exchangeRate, sub.baseCurrency) }})
                </span>
              </AdminDetailRow>
              <Separator />
              <AdminDetailRow label="Payment Count" :value="String(sub.paymentCount)" />
              <AdminDetailRow label="Average Payment">
                <span>{{ formatCurrency(avgPayment, sub.currency) }}</span>
                <span v-if="sub.exchangeRate !== 1" class="text-xs text-muted-foreground ml-1">
                  (≈ {{ formatCurrency(avgPayment * sub.exchangeRate, sub.baseCurrency) }})
                </span>
              </AdminDetailRow>
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
