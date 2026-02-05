import { ref, reactive, computed, type Ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Subscription } from '~/features/subscriptions/shared/types'

/**
 * Composable for managing subscription actions (pause, resume, cancel, change amount).
 * Handles dialog state and mutation logic for subscription operations.
 *
 * @param subscriptions - Reactive ref containing the array of subscriptions
 * @returns Dialog state, action handlers, and computed properties
 */
export function useSubscriptionActions(subscriptions: Ref<Subscription[]>) {
  // Pause state
  const showPauseDialog = ref(false)
  const pausingSubscriptionId = ref<string | null>(null)

  // Cancel state
  const showCancelDialog = ref(false)
  const cancellingSubscriptionId = ref<string | null>(null)

  // Change amount state
  const changeAmountState = reactive({
    open: false,
    subscriptionId: null as string | null,
    newAmount: ''
  })

  // Pause handlers
  const confirmPause = (id: string) => {
    pausingSubscriptionId.value = id
    showPauseDialog.value = true
  }

  const handlePause = () => {
    const sub = subscriptions.value.find((s) => s.id === pausingSubscriptionId.value)
    if (sub) {
      sub.status = 'paused'
      delete sub.nextBillingDate
      toast.success('Subscription paused successfully')
    }
    pausingSubscriptionId.value = null
    showPauseDialog.value = false
  }

  // Cancel handlers
  const confirmCancel = (id: string) => {
    cancellingSubscriptionId.value = id
    showCancelDialog.value = true
  }

  const handleCancel = () => {
    const sub = subscriptions.value.find((s) => s.id === cancellingSubscriptionId.value)
    if (sub) {
      sub.status = 'cancelled'
      delete sub.nextBillingDate
      toast.success('Subscription cancelled successfully')
    }
    cancellingSubscriptionId.value = null
    showCancelDialog.value = false
  }

  // Resume handler
  const handleResume = (id: string) => {
    const sub = subscriptions.value.find((s) => s.id === id)
    if (sub) {
      sub.status = 'active'
      const nextDate = new Date()
      nextDate.setMonth(nextDate.getMonth() + 1)
      sub.nextBillingDate = nextDate.toISOString()
      toast.success('Subscription resumed successfully')
    }
  }

  // Change amount handlers
  const openChangeAmount = (id: string) => {
    const sub = subscriptions.value.find((s) => s.id === id)
    if (sub) {
      changeAmountState.subscriptionId = id
      changeAmountState.newAmount = sub.amount.toString()
      changeAmountState.open = true
    }
  }

  const handleChangeAmount = () => {
    const sub = subscriptions.value.find((s) => s.id === changeAmountState.subscriptionId)
    if (sub && changeAmountState.newAmount) {
      const newAmount = parseFloat(changeAmountState.newAmount)
      if (newAmount > 0) {
        sub.amount = newAmount
        toast.success('Subscription amount updated successfully')
        changeAmountState.subscriptionId = null
        changeAmountState.newAmount = ''
        changeAmountState.open = false
      } else {
        toast.error('Please enter a valid amount')
      }
    }
  }

  const currentSubscription = computed(() =>
    changeAmountState.subscriptionId
      ? subscriptions.value.find((s) => s.id === changeAmountState.subscriptionId)
      : null
  )

  return {
    // Pause
    showPauseDialog,
    confirmPause,
    handlePause,

    // Cancel
    showCancelDialog,
    confirmCancel,
    handleCancel,

    // Resume
    handleResume,

    // Change amount
    changeAmountState,
    openChangeAmount,
    handleChangeAmount,
    currentSubscription
  }
}
