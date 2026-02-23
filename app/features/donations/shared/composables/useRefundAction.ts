import type { Ref } from 'vue'
import type { Transaction } from '~/features/donor-portal/types'
import { generateEntityId } from '~/lib/generateEntityId'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { toast } from 'vue-sonner'

interface UseRefundActionOptions {
  transaction: Ref<Transaction | undefined>
  allTransactions: Ref<Transaction[]>
  addTransaction: (t: Transaction) => void
  onSuccess?: () => void
}

/**
 * Shared refund logic for both admin and donor portal.
 * Caller is responsible for eligibility gating (portal) or not (admin).
 */
export function useRefundAction(options: UseRefundActionOptions) {
  const { transaction, allTransactions, addTransaction, onSuccess } = options
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

  function handleRefund() {
    if (!transaction.value) return
    const txn = transaction.value

    addTransaction({
      id: generateEntityId('txn'),
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
      paymentMethod: txn.paymentMethod,
      status: 'succeeded',
      donorId: txn.donorId,
      donorName: txn.donorName,
      donorEmail: txn.donorEmail,
      isAnonymous: txn.isAnonymous,
      giftAid: false,
      legalBasis: txn.legalBasis,
      createdAt: new Date().toISOString()
    })

    txn.status = 'refunded'

    toast.success('Refund processed', {
      description: `${formatAmount(txn.totalAmount, txn.currency)} has been refunded.`
    })

    onSuccess?.()
  }

  return { isRefunded, canRefund, handleRefund }
}
