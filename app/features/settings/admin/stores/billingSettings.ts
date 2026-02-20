import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BillingSettings, PaymentCard } from '~/features/settings/admin/types'
import { billingSettings as defaults } from '~/sample-api-responses/api-sample-response-settings'
import { toast } from 'vue-sonner'

export const useBillingSettingsStore = defineStore('billingSettings', () => {
  const billingEmail = ref(defaults.billingEmail)
  const paymentCard = ref<PaymentCard | undefined>(
    defaults.paymentCard ? { ...defaults.paymentCard } : undefined
  )
  const taxRate = ref(defaults.taxRate)
  const statements = ref(defaults.statements.map((s) => ({ ...s })))

  const paidStatements = computed(() => statements.value.filter((s) => s.status === 'paid'))
  const pendingStatements = computed(() => statements.value.filter((s) => s.status === 'pending'))

  function initialize(settings: BillingSettings) {
    billingEmail.value = settings.billingEmail
    paymentCard.value = settings.paymentCard ? { ...settings.paymentCard } : undefined
    taxRate.value = settings.taxRate
    statements.value = settings.statements.map((s) => ({ ...s }))
  }

  function updateBillingEmail(email: string) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ billing: { ...billing, billingEmail } })
    billingEmail.value = email
    $persist()
    toast.success('Billing email updated')
  }

  function updatePaymentCard(card: PaymentCard) {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ billing: { ...billing, paymentCard } })
    paymentCard.value = { ...card }
    $persist()
    toast.success('Payment card updated')
  }

  function removePaymentCard() {
    // TODO-SUPABASE: Replace with supabase.from('org_financial').update({ billing: { ...billing, paymentCard: null } })
    paymentCard.value = undefined
    $persist()
    toast.success('Payment card removed')
  }

  let hydrated = false
  function $hydrate() {
    if (hydrated) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_financial').select('billing').eq('org_id', orgId).single()
      const saved = sessionStorage.getItem('settings-billing')
      if (saved) initialize(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    hydrated = true
  }

  function $persist() {
    if (!import.meta.client) return
    try {
      // TODO-SUPABASE: Replace with supabase.from('org_financial').upsert({ org_id: orgId, billing: { billingEmail, paymentCard, taxRate, statements } })
      sessionStorage.setItem(
        'settings-billing',
        JSON.stringify({
          billingEmail: billingEmail.value,
          paymentCard: paymentCard.value,
          taxRate: taxRate.value,
          statements: statements.value
        })
      )
    } catch {
      /* ignore */
    }
  }

  if (import.meta.client) $hydrate()

  return {
    billingEmail,
    paymentCard,
    taxRate,
    statements,
    paidStatements,
    pendingStatements,
    updateBillingEmail,
    updatePaymentCard,
    removePaymentCard,
    $hydrate
  }
})
