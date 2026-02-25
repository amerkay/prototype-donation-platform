<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import { useRefundAction } from '~/features/donations/shared/composables/useRefundAction'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import PortalLineItemsCard from '~/features/donor-portal/components/PortalLineItemsCard.vue'
import PortalDetailRow from '~/features/donor-portal/components/PortalDetailRow.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { ICON_CLIPBOARD_LIST, ICON_SUBSCRIPTION, ICON_REFUND } from '~/lib/icons'

definePageMeta({ layout: 'portal' })

const route = useRoute()
const router = useRouter()
const { transactions, subscriptions, addTransaction } = useDonorPortal()
const { formatAmount, formatDate } = useCampaignFormatters()
const { checkEligibility } = useActionEligibility()

const transaction = computed(() => transactions.value.find((t) => t.id === route.params.id))

const {
  isRefunded,
  canRefund: canRefundBase,
  isSubscriptionPayment,
  alsoCancel,
  handleRefund
} = useRefundAction({
  transaction,
  allTransactions: transactions,
  addTransaction,
  subscriptions,
  onSuccess: () => router.push('/portal/donations')
})

const donorValueLastYear = computed(() => {
  if (!transaction.value) return 0
  const oneYearAgo = Date.now() - 365.25 * 24 * 60 * 60 * 1000
  const orgName = transaction.value.charityName
  return transactions.value
    .filter(
      (t) =>
        t.status === 'succeeded' &&
        t.charityName === orgName &&
        new Date(t.createdAt).getTime() >= oneYearAgo
    )
    .reduce((sum, t) => sum + t.totalAmount * t.exchangeRate, 0)
})

const eligibility = computed(() => {
  if (!transaction.value)
    return { canPause: false, canCancel: false, canRefund: false, canChangeAmount: false }
  return checkEligibility({
    transaction: transaction.value,
    donorValueLastYear: donorValueLastYear.value
  })
})

const canRefund = computed(() => eligibility.value.canRefund && canRefundBase.value)

const typeLabel = computed(() => {
  if (!transaction.value) return ''
  const map = { one_time: 'One-time', subscription_payment: 'Subscription', refund: 'Refund' }
  return map[transaction.value.type] ?? transaction.value.type
})

const paymentMethodLabel = computed(() => {
  if (!transaction.value) return ''
  const pm = transaction.value.paymentMethod
  if (pm.type === 'card' && pm.brand && pm.last4) return `${pm.brand} ****${pm.last4}`
  if (pm.type === 'paypal') return 'PayPal'
  if (pm.type === 'bank_transfer') return 'Bank Transfer'
  return pm.type
})

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/portal' },
  { label: 'Donation History', href: '/portal/donations' },
  { label: transaction.value?.campaignName ?? 'Transaction' }
])
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbs" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div v-if="!transaction" class="text-center py-12 text-muted-foreground">
        Transaction not found.
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-semibold tracking-tight">
                {{ transaction.campaignName }} —
                {{ formatAmount(transaction.totalAmount, transaction.currency) }}
                ({{ typeLabel }})
              </h1>
              <StatusBadge :status="transaction.status" />
              <Badge v-if="isRefunded" variant="secondary">Refunded</Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ transaction.charityName }} · {{ formatDate(transaction.createdAt) }}
            </p>
          </div>
          <AlertDialog v-if="canRefund">
            <AlertDialogTrigger as-child>
              <Button variant="destructive" size="sm">
                <ICON_REFUND class="size-4 mr-1.5" />
                Refund {{ formatAmount(transaction.totalAmount, transaction.currency) }}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Refund this donation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reverse the transaction of
                  {{ formatAmount(transaction.totalAmount, transaction.currency) }}. This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div
                v-if="isSubscriptionPayment && eligibility.canCancel"
                class="flex items-center gap-2 pt-2"
              >
                <Checkbox id="also-cancel-portal" v-model:checked="alsoCancel" />
                <label for="also-cancel-portal" class="text-sm">Also cancel the subscription</label>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction @click="handleRefund">Confirm Refund</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <!-- Detail Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Donation Info -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <ICON_CLIPBOARD_LIST class="h-4 w-4" />
                Donation Info
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <PortalDetailRow label="Campaign" :value="transaction.campaignName" />
              <PortalDetailRow label="Charity" :value="transaction.charityName" />
              <PortalDetailRow label="Date" :value="formatDate(transaction.createdAt)" />

              <PortalDetailRow v-if="transaction.giftAid" label="Gift Aid">
                <Badge variant="default">Declared</Badge>
              </PortalDetailRow>

              <div v-if="transaction.subscriptionId" class="text-sm text-muted-foreground">
                Part of a recurring subscription.
                <NuxtLink
                  :to="`/portal/subscriptions/${transaction.subscriptionId}`"
                  class="text-primary hover:underline"
                >
                  View Subscription
                </NuxtLink>
              </div>

              <template v-if="transaction.message || transaction.tribute">
                <Separator />
                <div v-if="transaction.message" class="rounded-md bg-muted/50 p-3">
                  <p class="text-sm italic text-muted-foreground">"{{ transaction.message }}"</p>
                </div>
                <PortalDetailRow
                  v-if="transaction.tribute"
                  :label="transaction.tribute.type === 'memorial' ? 'In Memory Of' : 'In Honour Of'"
                  :value="transaction.tribute.honoreeName"
                />
              </template>
            </CardContent>
          </Card>

          <!-- Payment & Totals -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <ICON_SUBSCRIPTION class="h-4 w-4" />
                Payment & Totals
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="space-y-1">
                <PortalDetailRow
                  label="Subtotal"
                  :value="formatAmount(transaction.subtotal, transaction.currency)"
                />
                <PortalDetailRow
                  v-if="transaction.coverCostsAmount"
                  label="Cover costs"
                  :value="formatAmount(transaction.coverCostsAmount, transaction.currency)"
                />
                <div class="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{{ formatAmount(transaction.totalAmount, transaction.currency) }}</span>
                </div>
              </div>

              <Separator />

              <PortalDetailRow label="Method" :value="paymentMethodLabel" />
              <PortalDetailRow label="Processor">
                <span class="capitalize">{{ transaction.processor }}</span>
              </PortalDetailRow>
              <PortalDetailRow label="Transaction ID">
                <span class="font-mono text-xs">{{ transaction.processorTransactionId }}</span>
              </PortalDetailRow>
            </CardContent>
          </Card>

          <!-- Line Items (full width) -->
          <PortalLineItemsCard
            :line-items="transaction.lineItems"
            :currency="transaction.currency"
            :campaign-name="transaction.campaignName"
            class="md:col-span-2"
          />
        </div>
      </template>
    </div>
  </div>
</template>
