<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const state = route.query.state as string

function handleAuthorize() {
  const accountId = `acct_mock_${Date.now().toString(36)}`
  navigateTo(
    `/admin/settings/payments/callback?provider=stripe&account_id=${accountId}&state=${state}`
  )
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div
          class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-[#635bff] text-white font-bold text-xl"
        >
          S
        </div>
        <CardTitle>Connect with Stripe</CardTitle>
        <CardDescription>
          Borneo Orangutan Survival Foundation wants to connect to your Stripe account
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="rounded-lg bg-muted p-3 text-sm space-y-1">
          <p class="font-medium">This will allow the platform to:</p>
          <ul class="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
            <li>Accept payments on your behalf</li>
            <li>Create charges and refunds</li>
            <li>View transaction history</li>
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
          <Button class="flex-1 bg-[#635bff] hover:bg-[#5851db]" @click="handleAuthorize">
            Authorize
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
