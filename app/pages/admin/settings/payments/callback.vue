<script setup lang="ts">
import { usePaymentSettingsStore } from '~/features/settings/admin/stores/paymentSettings'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const store = usePaymentSettingsStore()

const provider = route.query.provider as string
const state = route.query.state as string
const accountId = route.query.account_id as string | undefined
const merchantId = route.query.merchant_id as string | undefined

const savedState = import.meta.client ? sessionStorage.getItem('oauth-state') : null
const isValid = state && state === savedState

const status = ref<'success' | 'error'>('error')
const message = ref('')

if (isValid) {
  sessionStorage.removeItem('oauth-state')

  if (provider === 'stripe' && accountId) {
    store.completeStripeConnect(accountId)
    status.value = 'success'
    message.value = `Stripe account ${accountId} connected successfully.`
  } else if (provider === 'paypal' && merchantId) {
    store.completePaypalConnect(merchantId)
    status.value = 'success'
    message.value = `PayPal merchant ${merchantId} connected successfully.`
  } else {
    message.value = 'Missing connection parameters.'
  }
} else {
  message.value = 'Invalid state token. Connection rejected for security.'
}

onMounted(() => {
  setTimeout(() => navigateTo('/admin/settings/payments'), 2000)
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <Card class="w-full max-w-sm text-center">
      <CardHeader>
        <div class="mx-auto mb-2">
          <CheckCircle2 v-if="status === 'success'" class="h-12 w-12 text-green-500" />
          <XCircle v-else class="h-12 w-12 text-destructive" />
        </div>
        <CardTitle>{{ status === 'success' ? 'Connected!' : 'Connection Failed' }}</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">{{ message }}</p>
        <p class="text-xs text-muted-foreground mt-2">Redirecting back to settings...</p>
      </CardContent>
    </Card>
  </div>
</template>
