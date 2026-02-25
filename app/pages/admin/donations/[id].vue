<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import DonorInfoCard from '~/features/_admin/components/DonorInfoCard.vue'
import LineItemsCard from '~/features/_admin/components/LineItemsCard.vue'
import CustomFieldsCard from '~/features/_admin/components/CustomFieldsCard.vue'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { useRefundAction } from '~/features/donations/shared/composables/useRefundAction'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDateTime } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import RefundConfirmationDialog from '~/features/donations/shared/components/RefundConfirmationDialog.vue'
import { ICON_DONATION, ICON_SUBSCRIPTION, ICON_RECURRING } from '~/lib/icons'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { getTransactionById, rawTransactions, addTransaction } = useDonations()
const { subscriptions } = useAdminSubscriptions()

const txn = computed(() => getTransactionById(route.params.id as string))

const { isRefunded, canRefund, isSubscriptionPayment, alsoCancel, handleRefund } = useRefundAction({
  transaction: txn,
  allTransactions: rawTransactions,
  addTransaction,
  subscriptions,
  onSuccess: () => navigateTo('/admin/donations')
})

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Donations', href: '/admin/donations' },
  {
    label: txn.value
      ? `${txn.value.donorName} — ${formatCurrency(txn.value.totalAmount, txn.value.currency)} ${txn.value.subscriptionId ? '(Recurring)' : '(One-time)'}`
      : 'Not Found'
  }
])
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!txn" class="py-12 text-center">
        <p class="text-muted-foreground">Transaction not found.</p>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">
                {{ txn.donorName }} — {{ formatCurrency(txn.totalAmount, txn.currency) }}
              </h1>
              <Badge v-if="txn.subscriptionId" variant="outline" class="text-xs">Recurring</Badge>
              <Badge v-else variant="outline" class="text-xs">One-time</Badge>
              <StatusBadge :status="txn.status" />
              <Badge v-if="isRefunded" variant="secondary">Refunded</Badge>
            </div>
            <p class="text-sm text-muted-foreground">{{ formatDateTime(txn.createdAt) }}</p>
          </div>
          <RefundConfirmationDialog
            v-model:also-cancel="alsoCancel"
            :can-refund="canRefund"
            :formatted-amount="formatCurrency(txn.totalAmount, txn.currency)"
            :show-cancel-subscription="isSubscriptionPayment"
            @confirm="handleRefund"
          />
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Donor -->
          <DonorInfoCard
            :donor-id="txn.donorId"
            :donor-name="txn.donorName"
            :donor-email="txn.donorEmail"
            :is-anonymous="txn.isAnonymous"
            :message="txn.message"
            :tribute="txn.tribute"
            :address="txn.donorAddress"
            :linkable="true"
          />

          <!-- Payment -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <ICON_SUBSCRIPTION class="h-4 w-4" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow label="Method">
                <span class="capitalize">{{ paymentMethodLabel(txn.paymentMethod) }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Processor">
                <span class="capitalize">{{ txn.processor }}</span>
              </AdminDetailRow>
              <AdminDetailRow label="Transaction ID">
                <span class="font-mono text-xs">{{ txn.processorTransactionId }}</span>
              </AdminDetailRow>
              <Separator />
              <AdminDetailRow label="Subtotal">
                <span>{{ formatCurrency(txn.subtotal, txn.currency) }}</span>
                <span v-if="txn.exchangeRate !== 1" class="text-xs text-muted-foreground ml-1">
                  (≈ {{ formatCurrency(txn.subtotal * txn.exchangeRate, txn.baseCurrency) }})
                </span>
              </AdminDetailRow>
              <AdminDetailRow v-if="txn.coverCostsAmount > 0" label="Cover Costs">
                <span>{{ formatCurrency(txn.coverCostsAmount, txn.currency) }}</span>
                <span v-if="txn.exchangeRate !== 1" class="text-xs text-muted-foreground ml-1">
                  (≈
                  {{ formatCurrency(txn.coverCostsAmount * txn.exchangeRate, txn.baseCurrency) }})
                </span>
              </AdminDetailRow>
              <div class="flex justify-between font-medium">
                <span>Total</span>
                <span>
                  {{ formatCurrency(txn.totalAmount, txn.currency) }}
                  <span
                    v-if="txn.exchangeRate !== 1"
                    class="text-xs text-muted-foreground ml-1 font-normal"
                  >
                    (≈ {{ formatCurrency(txn.totalAmount * txn.exchangeRate, txn.baseCurrency) }})
                  </span>
                </span>
              </div>
              <div v-if="txn.subscriptionId" class="flex items-center gap-2 pt-1">
                <ICON_RECURRING class="h-4 w-4 text-muted-foreground" />
                <span class="text-muted-foreground">Recurring —</span>
                <NuxtLink
                  :to="`/admin/subscriptions/${txn.subscriptionId}`"
                  class="text-primary hover:underline text-sm"
                >
                  View Subscription
                </NuxtLink>
              </div>
            </CardContent>
          </Card>

          <!-- Custom Fields -->
          <CustomFieldsCard v-if="txn.customFields" :custom-fields="txn.customFields" />

          <!-- Gift Aid -->
          <Card v-if="txn.giftAid">
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <ICON_DONATION class="h-4 w-4" />
                Gift Aid
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <AdminDetailRow v-if="txn.giftAidAmount" label="Gift Aid Amount">
                <span class="font-medium text-green-600">
                  +{{ formatCurrency(txn.giftAidAmount, txn.currency) }}
                </span>
                <span class="ml-1 text-muted-foreground">(25% top-up)</span>
              </AdminDetailRow>
              <AdminDetailRow v-if="txn.giftAidDeclarationId" label="Declaration">
                <span class="font-mono text-xs">{{ txn.giftAidDeclarationId }}</span>
              </AdminDetailRow>
              <AdminDetailRow v-if="txn.donorAddress" label="Home Address">
                {{ txn.donorAddress.line1
                }}<template v-if="txn.donorAddress.line2">, {{ txn.donorAddress.line2 }}</template
                >, {{ txn.donorAddress.city }}, {{ txn.donorAddress.postcode }}
              </AdminDetailRow>
              <div
                v-if="txn.giftAidReversed"
                class="flex items-center gap-2 rounded bg-destructive/10 px-3 py-2 text-destructive"
              >
                <span class="font-medium">Gift Aid Reversed</span>
                <span v-if="txn.giftAidAmountReversed">
                  — {{ formatCurrency(txn.giftAidAmountReversed, txn.currency) }}
                </span>
              </div>
              <p v-if="!txn.giftAidAmount" class="text-muted-foreground">
                Donor declared Gift Aid eligibility for this donation.
              </p>
            </CardContent>
          </Card>

          <!-- Order Details (full width) -->
          <LineItemsCard
            :line-items="txn.lineItems"
            :currency="txn.currency"
            title="Order Details"
            :campaign-name="txn.campaignName"
            :campaign-link="`/admin/campaigns/${txn.campaignId}`"
            class="md:col-span-2"
          />
        </div>
      </template>
    </div>
  </div>
</template>
