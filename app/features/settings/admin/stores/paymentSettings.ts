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

  // Stripe — all immediate actions
  function toggleStripeTestMode(testMode: boolean) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, stripe: { ...stripe, testMode } } })
    stripe.value = { ...stripe.value, testMode }
    $persist()
  }

  function completeStripeConnect(accountId: string) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, stripe: { connected, accountId, connectedAt } } })
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
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, stripe: { connected: false } } })
    stripe.value = {
      ...stripe.value,
      connected: false,
      accountId: undefined,
      connectedAt: undefined
    }
    $persist()
    toast.success('Stripe disconnected')
  }

  // PayPal — all immediate actions
  function togglePaypalTestMode(testMode: boolean) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, paypal: { ...paypal, testMode } } })
    paypal.value = { ...paypal.value, testMode }
    $persist()
  }

  function completePaypalConnect(merchantId: string) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, paypal: { connected, merchantId, connectedAt } } })
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
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ payments: { ...payments, paypal: { connected: false } } })
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
      // TODO-SUPABASE: Replace with supabase.from('org_financial').select('payments').eq('org_id', orgId).single()
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
      // TODO-SUPABASE: Replace with supabase.from('org_financial').upsert({ org_id: orgId, payments: { stripe, paypal } })
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
    toggleStripeTestMode,
    completeStripeConnect,
    disconnectStripe,
    togglePaypalTestMode,
    completePaypalConnect,
    disconnectPaypal,
    $hydrate
  }
})
