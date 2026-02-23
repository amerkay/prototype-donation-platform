<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useActionEligibility } from '~/features/donor-portal/composables/useActionEligibility'
import { useRefundAction } from '~/features/donations/shared/composables/useRefundAction'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import PortalLineItemsCard from '~/features/donor-portal/components/PortalLineItemsCard.vue'
import PortalDonorCard from '~/features/donor-portal/components/PortalDonorCard.vue'
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
import { Undo2, ExternalLink } from 'lucide-vue-next'

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
  if (!transaction.value) return { canPause: false, canCancel: false, canRefund: false }
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
  { label: transaction.value ? `#${transaction.value.id.slice(0, 8)}` : 'Transaction' }
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
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h1 class="text-2xl font-semibold tracking-tight">
              Transaction #{{ transaction.id.slice(0, 8) }}
            </h1>
            <p class="text-sm text-muted-foreground">{{ formatDate(transaction.createdAt) }}</p>
          </div>
          <StatusBadge :status="transaction.status">
            {{ transaction.status }}
          </StatusBadge>
        </div>

        <!-- Detail Cards Grid -->
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <!-- Summary -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-muted-foreground">Campaign</span>
                  <p class="font-medium">{{ transaction.campaignName }}</p>
                </div>
                <div>
                  <span class="text-muted-foreground">Charity</span>
                  <p class="font-medium">{{ transaction.charityName }}</p>
                </div>
                <div>
                  <span class="text-muted-foreground">Type</span>
                  <p class="font-medium">{{ typeLabel }}</p>
                </div>
                <div>
                  <span class="text-muted-foreground">Currency</span>
                  <p class="font-medium">{{ transaction.currency }}</p>
                </div>
              </div>

              <Separator />

              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span>{{ formatAmount(transaction.subtotal, transaction.currency) }}</span>
                </div>
                <div v-if="transaction.coverCostsAmount" class="flex justify-between">
                  <span class="text-muted-foreground">Cover costs</span>
                  <span>{{
                    formatAmount(transaction.coverCostsAmount, transaction.currency)
                  }}</span>
                </div>
                <div class="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{{ formatAmount(transaction.totalAmount, transaction.currency) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Line Items -->
          <PortalLineItemsCard
            :line-items="transaction.lineItems"
            :currency="transaction.currency"
          />

          <!-- Payment -->
          <Card>
            <CardHeader>
              <CardTitle class="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Method</span>
                <span>{{ paymentMethodLabel }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Processor</span>
                <span class="capitalize">{{ transaction.processor }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Transaction ID</span>
                <span class="font-mono text-xs">{{ transaction.processorTransactionId }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- Donor -->
          <PortalDonorCard
            :donor-name="transaction.donorName"
            :donor-email="transaction.donorEmail"
            :is-anonymous="transaction.isAnonymous"
            :message="transaction.message"
            :tribute="transaction.tribute"
          />

          <!-- Gift Aid -->
          <Card v-if="transaction.giftAid">
            <CardHeader>
              <CardTitle class="text-base">Gift Aid</CardTitle>
            </CardHeader>
            <CardContent class="flex items-center gap-3 text-sm">
              <Badge variant="default">Gift Aid Declared</Badge>
              <span v-if="transaction.giftAidAmount" class="font-medium">
                +{{ formatAmount(transaction.giftAidAmount, transaction.currency) }}
              </span>
            </CardContent>
          </Card>

          <!-- Related Subscription -->
          <Card v-if="transaction.subscriptionId">
            <CardContent class="flex items-center justify-between py-4">
              <span class="text-sm text-muted-foreground">Part of a recurring subscription</span>
              <Button variant="outline" size="sm" as-child>
                <NuxtLink
                  :to="`/portal/subscriptions/${transaction.subscriptionId}`"
                  class="inline-flex items-center gap-1.5"
                >
                  View Subscription
                  <ExternalLink class="size-3.5" />
                </NuxtLink>
              </Button>
            </CardContent>
          </Card>
        </div>

        <!-- Refund Action -->
        <div v-if="canRefund" class="flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger as-child>
              <Button variant="destructive">
                <Undo2 class="size-4 mr-1.5" />
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

        <!-- Already refunded -->
        <div v-else-if="isRefunded" class="flex justify-end">
          <Badge variant="secondary">Refunded</Badge>
        </div>
      </template>
    </div>
  </div>
</template>
