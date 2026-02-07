import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PaymentProcessorSettings } from '~/features/settings/admin/types'
import { paymentProcessorSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { toast } from 'vue-sonner'

export const usePaymentSettingsStore = defineStore('paymentSettings', () => {
  const stripe = ref({ ...defaults.stripe })
  const paypal = ref({ ...defaults.paypal })

  function initialize(settings: PaymentProcessorSettings) {
    stripe.value = { ...settings.stripe }
    paypal.value = { ...settings.paypal }
  }

  function toggleStripeEnabled(enabled: boolean) {
    stripe.value = { ...stripe.value, enabled }
    $persist()
  }

  function toggleStripeTestMode(testMode: boolean) {
    stripe.value = { ...stripe.value, testMode }
    $persist()
  }

  function completeStripeConnect(accountId: string) {
    stripe.value = {
      ...stripe.value,
      connected: true,
      accountId,
      connectedAt: new Date().toISOString()
    }
    $persist()
    toast.success('Stripe connected successfully')
  }

  function disconnectStripe() {
    stripe.value = {
      ...stripe.value,
      connected: false,
      accountId: undefined,
      connectedAt: undefined
    }
    $persist()
    toast.success('Stripe disconnected')
  }

  function togglePaypalEnabled(enabled: boolean) {
    paypal.value = { ...paypal.value, enabled }
    $persist()
  }

  function togglePaypalTestMode(testMode: boolean) {
    paypal.value = { ...paypal.value, testMode }
    $persist()
  }

  function completePaypalConnect(merchantId: string) {
    paypal.value = {
      ...paypal.value,
      connected: true,
      merchantId,
      connectedAt: new Date().toISOString()
    }
    $persist()
    toast.success('PayPal connected successfully')
  }

  function disconnectPaypal() {
    paypal.value = {
      ...paypal.value,
      connected: false,
      merchantId: undefined,
      connectedAt: undefined
    }
    $persist()
    toast.success('PayPal disconnected')
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      const saved = sessionStorage.getItem('settings-payments')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function $persist() {
    if (!import.meta.client) return
    try {
      sessionStorage.setItem(
        'settings-payments',
        JSON.stringify({ stripe: stripe.value, paypal: paypal.value })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    stripe,
    paypal,
    toggleStripeEnabled,
    toggleStripeTestMode,
    completeStripeConnect,
    disconnectStripe,
    togglePaypalEnabled,
    togglePaypalTestMode,
    completePaypalConnect,
    disconnectPaypal,
    $hydrate
  }
})
