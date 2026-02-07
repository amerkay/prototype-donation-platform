<script setup lang="ts">
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import { usePaymentSettingsStore } from '~/features/settings/admin/stores/paymentSettings'
import { formatDateTime } from '~/lib/formatDate'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Unplug } from 'lucide-vue-next'

const store = usePaymentSettingsStore()
const showDisconnect = ref(false)

function startConnect() {
  const state = crypto.randomUUID()
  sessionStorage.setItem('oauth-state', state)
  navigateTo(`/admin/settings/payments/stripe-connect?state=${state}`)
}

function confirmDisconnect() {
  store.disconnectStripe()
  showDisconnect.value = false
}
</script>

<template>
  <Card class="overflow-hidden">
    <div class="h-1" style="background-color: #635bff" />

    <CardHeader>
      <div class="flex items-center gap-3">
        <img src="/imgs/stripe-wordmark.svg" alt="Stripe" class="h-8 w-auto" />
        <StatusBadge v-if="store.stripe.connected" status="active">Connected</StatusBadge>
        <StatusBadge v-else status="draft">Not connected</StatusBadge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <template v-if="store.stripe.connected">
        <div class="space-y-1">
          <p class="text-sm font-medium">Account ID</p>
          <p class="text-sm text-muted-foreground font-mono">{{ store.stripe.accountId }}</p>
          <p v-if="store.stripe.connectedAt" class="text-xs text-muted-foreground">
            Connected {{ formatDateTime(store.stripe.connectedAt) }}
          </p>
        </div>

        <Separator />

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

        <Button variant="outline" size="sm" @click="showDisconnect = true">
          <Unplug class="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </template>

      <template v-else>
        <p class="text-sm text-muted-foreground">
          Connect your Stripe account to accept card payments, Apple Pay, Google Pay, and more.
        </p>
        <Button
          class="text-white font-medium"
          style="background-color: #635bff"
          @click="startConnect"
        >
          <Icon name="simple-icons:stripe" class="h-5 w-5 mr-2" />
          Connect with Stripe
        </Button>
      </template>
    </CardContent>

    <AdminDeleteDialog
      :open="showDisconnect"
      title="Disconnect Stripe?"
      description="This will remove the connection. You'll need to reconnect to process payments."
      confirm-label="Disconnect"
      @update:open="(v) => !v && (showDisconnect = false)"
      @confirm="confirmDisconnect"
    />
  </Card>
</template>
