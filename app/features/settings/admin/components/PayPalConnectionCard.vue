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
  navigateTo(`/admin/settings/payments/paypal-connect?state=${state}`)
}

function confirmDisconnect() {
  store.disconnectPaypal()
  showDisconnect.value = false
}
</script>

<template>
  <Card class="overflow-hidden">
    <div class="h-1" style="background-color: #003087" />

    <CardHeader>
      <div class="flex items-center gap-3">
        <img src="/imgs/paypal-wordmark.svg" alt="PayPal" class="h-7 w-auto" />
        <StatusBadge v-if="store.paypal.connected" status="active">Connected</StatusBadge>
        <StatusBadge v-else status="draft">Not connected</StatusBadge>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <template v-if="store.paypal.connected">
        <div class="space-y-1">
          <p class="text-sm font-medium">Merchant ID</p>
          <p class="text-sm text-muted-foreground font-mono">{{ store.paypal.merchantId }}</p>
          <p v-if="store.paypal.connectedAt" class="text-xs text-muted-foreground">
            Connected {{ formatDateTime(store.paypal.connectedAt) }}
          </p>
        </div>

        <Separator />

        <div class="flex items-center justify-between">
          <div>
            <Label>Sandbox Mode</Label>
            <p class="text-xs text-muted-foreground">Use PayPal sandbox (no real charges)</p>
          </div>
          <Switch :checked="store.paypal.testMode" @update:checked="store.togglePaypalTestMode" />
        </div>

        <Separator />

        <Button variant="outline" size="sm" @click="showDisconnect = true">
          <Unplug class="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </template>

      <template v-else>
        <p class="text-sm text-muted-foreground">
          Connect your PayPal account to accept PayPal payments, Venmo, and Pay Later options.
        </p>
        <Button
          class="text-white font-medium"
          style="background-color: #0070ba"
          @click="startConnect"
        >
          <Icon name="simple-icons:paypal" class="h-5 w-5 mr-2" />
          Connect with PayPal
        </Button>
      </template>
    </CardContent>

    <AdminDeleteDialog
      :open="showDisconnect"
      title="Disconnect PayPal?"
      description="This will remove the connection. You'll need to reconnect to process payments."
      confirm-label="Disconnect"
      @update:open="(v) => !v && (showDisconnect = false)"
      @confirm="confirmDisconnect"
    />
  </Card>
</template>
