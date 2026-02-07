<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import { usePaymentSettingsStore } from '~/features/settings/admin/stores/paymentSettings'
import { formatDateTime } from '~/lib/formatDate'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, Unplug } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const store = usePaymentSettingsStore()

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Settings', href: '#' },
  { label: 'Payment Processors' }
]

const disconnecting = ref<'stripe' | 'paypal' | null>(null)

function startStripeConnect() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth-state', state)
  navigateTo(`/admin/settings/payments/stripe-connect?state=${state}`)
}

function startPaypalConnect() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth-state', state)
  navigateTo(`/admin/settings/payments/paypal-connect?state=${state}`)
}

function confirmDisconnect() {
  if (disconnecting.value === 'stripe') store.disconnectStripe()
  else if (disconnecting.value === 'paypal') store.disconnectPaypal()
  disconnecting.value = null
}

const formatDate = formatDateTime
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col gap-6 px-4 pt-0 pb-4">
      <!-- Stripe -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                Stripe
                <StatusBadge v-if="store.stripe.connected" status="active"> Connected </StatusBadge>
              </CardTitle>
              <CardDescription>Accept card payments via Stripe Connect</CardDescription>
            </div>
            <Switch :checked="store.stripe.enabled" @update:checked="store.toggleStripeEnabled" />
          </div>
        </CardHeader>
        <CardContent v-if="store.stripe.enabled" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <Label>Test Mode</Label>
              <p class="text-xs text-muted-foreground">
                Use Stripe test environment (no real charges)
              </p>
            </div>
            <Switch :checked="store.stripe.testMode" @update:checked="store.toggleStripeTestMode" />
          </div>

          <Separator />

          <div v-if="store.stripe.connected" class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">Account ID</p>
                <p class="text-sm text-muted-foreground font-mono">{{ store.stripe.accountId }}</p>
                <p v-if="store.stripe.connectedAt" class="text-xs text-muted-foreground mt-1">
                  Connected {{ formatDate(store.stripe.connectedAt) }}
                </p>
              </div>
              <Button variant="outline" size="sm" @click="disconnecting = 'stripe'">
                <Unplug class="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
          <div v-else>
            <Button @click="startStripeConnect">
              <ExternalLink class="w-4 h-4 mr-2" />
              Connect with Stripe
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- PayPal -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="flex items-center gap-2">
                PayPal
                <StatusBadge v-if="store.paypal.connected" status="active"> Connected </StatusBadge>
              </CardTitle>
              <CardDescription>Accept payments via PayPal Commerce Platform</CardDescription>
            </div>
            <Switch :checked="store.paypal.enabled" @update:checked="store.togglePaypalEnabled" />
          </div>
        </CardHeader>
        <CardContent v-if="store.paypal.enabled" class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <Label>Sandbox Mode</Label>
              <p class="text-xs text-muted-foreground">Use PayPal sandbox (no real charges)</p>
            </div>
            <Switch :checked="store.paypal.testMode" @update:checked="store.togglePaypalTestMode" />
          </div>

          <Separator />

          <div v-if="store.paypal.connected" class="space-y-2">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">Merchant ID</p>
                <p class="text-sm text-muted-foreground font-mono">{{ store.paypal.merchantId }}</p>
                <p v-if="store.paypal.connectedAt" class="text-xs text-muted-foreground mt-1">
                  Connected {{ formatDate(store.paypal.connectedAt) }}
                </p>
              </div>
              <Button variant="outline" size="sm" @click="disconnecting = 'paypal'">
                <Unplug class="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
          <div v-else>
            <Button @click="startPaypalConnect">
              <ExternalLink class="w-4 h-4 mr-2" />
              Connect with PayPal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Disconnect Confirmation -->
    <AdminDeleteDialog
      :open="!!disconnecting"
      :title="`Disconnect ${disconnecting === 'stripe' ? 'Stripe' : 'PayPal'}?`"
      description="This will remove the connection. You'll need to reconnect to process payments."
      confirm-label="Disconnect"
      @update:open="(v) => !v && (disconnecting = null)"
      @confirm="confirmDisconnect"
    />
  </div>
</template>
