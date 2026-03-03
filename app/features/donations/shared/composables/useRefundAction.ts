import type { Ref } from 'vue'
import type { Transaction } from '~/features/donor-portal/types'
import type { Subscription } from '~/features/subscriptions/shared/types'
import { generateEntityId } from '~/lib/generateEntityId'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { toast } from 'vue-sonner'

interface UseRefundActionOptions {
  transaction: Ref<Transaction | undefined>
  allTransactions: Ref<Transaction[]>
  addTransaction: (t: Transaction) => void
  subscriptions?: Ref<Subscription[]>
  onSuccess?: () => void
}

/**
 * Shared refund logic for both admin and donor portal.
 * Caller is responsible for eligibility gating (portal) or not (admin).
 */
export function useRefundAction(options: UseRefundActionOptions) {
  const { transaction, allTransactions, addTransaction, subscriptions, onSuccess } = options
  const { formatAmount } = useCampaignFormatters()

  const isRefunded = computed(() => {
    if (!transaction.value) return false
    if (transaction.value.status === 'refunded') return true
    return allTransactions.value.some(
      (t) => t.type === 'refund' && t.refundOfTransactionId === transaction.value!.id
    )
  })

  const canRefund = computed(
    () =>
      !isRefunded.value &&
      transaction.value?.type !== 'refund' &&
      transaction.value?.status === 'succeeded'
  )

  const isSubscriptionPayment = computed(
    () => transaction.value?.type === 'subscription_payment' && !!transaction.value?.subscriptionId
  )

  const alsoCancel = ref(false)

  function handleRefund() {
    if (!transaction.value) return
    const txn = transaction.value

    addTransaction({
      id: generateEntityId('txn'),
      organizationId: txn.organizationId,
      type: 'refund',
      refundOfTransactionId: txn.id,
      processor: txn.processor,
      processorTransactionId: `rf_${txn.processorTransactionId}`,
      subscriptionId: txn.subscriptionId,
      campaignId: txn.campaignId,
      campaignName: txn.campaignName,
      charityName: txn.charityName,
      lineItems: txn.lineItems,
      subtotal: -txn.subtotal,
      coverCostsAmount: -txn.coverCostsAmount,
      totalAmount: -txn.totalAmount,
      currency: txn.currency,
      baseCurrency: txn.baseCurrency,
      exchangeRate: txn.exchangeRate,
      campaignCurrency: txn.campaignCurrency,
      campaignExchangeRate: txn.campaignExchangeRate,
      paymentMethod: txn.paymentMethod,
      status: 'succeeded',
      donorId: txn.donorId,
      donorName: txn.donorName,
      donorEmail: txn.donorEmail,
      isAnonymous: txn.isAnonymous,
      giftAid: false,
      matchedAmount: 0,
      legalBasis: txn.legalBasis,
      createdAt: new Date().toISOString()
    })

    txn.status = 'refunded'

    // Cancel related subscription if requested
    let cancelled = false
    if (alsoCancel.value && subscriptions?.value && txn.subscriptionId) {
      const sub = subscriptions.value.find((s) => s.id === txn.subscriptionId)
      if (sub) {
        sub.status = 'cancelled'
        sub.nextBillingDate = undefined as unknown as string
        cancelled = true
      }
    }

    const desc = cancelled
      ? `${formatAmount(txn.totalAmount, txn.currency)} refunded and subscription cancelled.`
      : `${formatAmount(txn.totalAmount, txn.currency)} has been refunded.`

    toast.success(cancelled ? 'Refund processed & subscription cancelled' : 'Refund processed', {
      description: desc
    })

    alsoCancel.value = false
    onSuccess?.()
  }

  return { isRefunded, canRefund, isSubscriptionPayment, alsoCancel, handleRefund }
}
