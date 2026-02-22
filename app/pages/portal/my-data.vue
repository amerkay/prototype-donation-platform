<script setup lang="ts">
import { Download, FileText, Heart, Shield, ShieldCheck } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { formatDate, formatDateTime } from '~/lib/formatDate'
import {
  getUserGiftAidDeclarations,
  getUserConsentRecords
} from '~/sample-api-responses/api-sample-response-transactions'

definePageMeta({ layout: 'portal' })

const { transactions, subscriptions } = useDonorPortal()

const CURRENT_USER_EMAIL = 'awesome@charity.co.uk'

const declarations = computed(() => getUserGiftAidDeclarations(CURRENT_USER_EMAIL))
const consentRecords = computed(() => getUserConsentRecords(CURRENT_USER_EMAIL))

const PURPOSE_LABELS: Record<string, string> = {
  marketing_email: 'Marketing Emails'
}

function downloadMyData() {
  const data = {
    exportDate: new Date().toISOString(),
    donor: {
      name: 'Wild Amer',
      email: CURRENT_USER_EMAIL
    },
    transactions: transactions.value,
    subscriptions: subscriptions.value,
    giftAidDeclarations: getUserGiftAidDeclarations(CURRENT_USER_EMAIL),
    consentRecords: getUserConsentRecords(CURRENT_USER_EMAIL)
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'My Data' }]" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">My Data</h1>
        <p class="text-sm text-muted-foreground">
          View and export your personal data. Your rights under GDPR and privacy regulations.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Download class="size-5" />
              Download My Data
            </CardTitle>
            <CardDescription>
              Export all your personal data as a JSON file. Includes donation history,
              subscriptions, Gift Aid declarations, and consent records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button @click="downloadMyData">
              <Download class="mr-2 size-4" />
              Download My Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="size-5" />
              Your Privacy Rights
            </CardTitle>
            <CardDescription>
              Under GDPR and applicable privacy laws, you have the right to access, correct, and
              request deletion of your personal data.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong class="text-foreground">Right to Access:</strong> Download all data we hold
              about you using the button above.
            </p>
            <p>
              <strong class="text-foreground">Right to Rectification:</strong> Contact us to correct
              any inaccurate personal data.
            </p>
            <p>
              <strong class="text-foreground">Right to Erasure:</strong> Request deletion of your
              personal data. Note: financial records required by law will be anonymized, not
              deleted.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="size-5" />
            Data We Hold
          </CardTitle>
          <CardDescription>
            Summary of the personal data associated with your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded-md border p-3">
              <p class="font-medium">Transactions</p>
              <p class="text-2xl font-bold">{{ transactions.length }}</p>
            </div>
            <div class="rounded-md border p-3">
              <p class="font-medium">Subscriptions</p>
              <p class="text-2xl font-bold">{{ subscriptions.length }}</p>
            </div>
            <div class="rounded-md border p-3">
              <p class="font-medium">Gift Aid Declarations</p>
              <p class="text-2xl font-bold">{{ declarations.length }}</p>
            </div>
            <div class="rounded-md border p-3">
              <p class="font-medium">Consent Records</p>
              <p class="text-2xl font-bold">{{ consentRecords.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Gift Aid Declarations -->
      <Card v-if="declarations.length">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Heart class="size-5" />
            Gift Aid Declarations
          </CardTitle>
          <CardDescription>
            Your HMRC Gift Aid declarations. These allow charities to claim an extra 25% on your
            donations at no cost to you.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="decl in declarations" :key="decl.id" class="rounded-md border p-4 text-sm">
            <div class="flex items-center gap-2 mb-2">
              <Badge :variant="decl.isActive ? 'default' : 'secondary'">
                {{ decl.isActive ? 'Active' : 'Cancelled' }}
              </Badge>
              <span class="text-muted-foreground">
                Declared {{ formatDate(decl.declaredAt) }}
              </span>
            </div>
            <div class="space-y-1 text-muted-foreground">
              <p v-if="decl.coversFrom">
                Covers all donations from {{ formatDate(decl.coversFrom) }}
              </p>
              <p v-else>Covers all donations</p>
              <p>
                Home address: {{ decl.donorAddress.line1
                }}<template v-if="decl.donorAddress.line2">, {{ decl.donorAddress.line2 }}</template
                >, {{ decl.donorAddress.city }}, {{ decl.donorAddress.postcode }}
              </p>
              <p v-if="decl.cancelledAt" class="text-destructive">
                Cancelled {{ formatDate(decl.cancelledAt) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Consent History -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <ShieldCheck class="size-5" />
            Consent History
          </CardTitle>
          <CardDescription>
            A record of your marketing consent preferences. Every opt-in and opt-out is logged.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="consentRecords.length === 0" class="text-sm text-muted-foreground">
            No consent records on file.
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="record in consentRecords"
              :key="record.id"
              class="flex flex-col gap-1 rounded border p-3 text-sm"
            >
              <div class="flex items-center gap-2">
                <span class="font-medium">{{
                  PURPOSE_LABELS[record.purpose] ?? record.purpose
                }}</span>
                <Badge :variant="record.granted ? 'default' : 'secondary'">
                  {{ record.granted ? 'Opted In' : 'Opted Out' }}
                </Badge>
                <span class="ml-auto text-xs text-muted-foreground">
                  {{ formatDateTime(record.recordedAt) }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ record.wordingShown }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
