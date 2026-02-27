<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const state = route.query.state as string
const provider = route.params.provider as string

const configs = {
  stripe: {
    label: 'Stripe',
    letter: 'S',
    color: '#635bff',
    hoverColor: '#5851db',
    description: 'your Stripe account',
    queryParam: 'account_id',
    mockPrefix: 'acct_mock_',
    permissions: [
      'Accept payments on your behalf',
      'Create charges and refunds',
      'View transaction history'
    ]
  },
  paypal: {
    label: 'PayPal',
    letter: 'P',
    color: '#003087',
    hoverColor: '#002569',
    description: 'your PayPal merchant account',
    queryParam: 'merchant_id',
    mockPrefix: 'MP_mock_',
    permissions: [
      'Accept PayPal payments on your behalf',
      'Process refunds',
      'View PayPal transaction history'
    ]
  }
} as const

const config = computed(() => configs[provider as keyof typeof configs])

function handleAuthorize() {
  const id = `${config.value.mockPrefix}${Date.now().toString(36)}`
  navigateTo(
    `/admin/settings/payments/callback?provider=${provider}&${config.value.queryParam}=${id}&state=${state}`
  )
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div
          class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg text-white font-bold text-xl"
          :style="{ backgroundColor: config.color }"
        >
          {{ config.letter }}
        </div>
        <CardTitle>Connect with {{ config.label }}</CardTitle>
        <CardDescription>
          Borneo Orangutan Survival Foundation wants to connect to {{ config.description }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="rounded-lg bg-muted p-3 text-sm space-y-1">
          <p class="font-medium">This will allow the platform to:</p>
          <ul class="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
            <li v-for="permission in config.permissions" :key="permission">{{ permission }}</li>
          </ul>
        </div>
        <Separator />
        <p class="text-xs text-muted-foreground text-center">
          This is a simulated OAuth flow for prototype purposes.
        </p>
        <div class="flex gap-2">
          <Button variant="outline" class="flex-1" @click="navigateTo('/admin/settings/payments')">
            Cancel
          </Button>
          <Button
            class="flex-1 text-white"
            :style="{ backgroundColor: config.color }"
            @click="handleAuthorize"
          >
            Authorize
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
