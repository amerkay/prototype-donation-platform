<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
import { getUserConsentRecords } from '~/sample-api-responses/api-sample-response-transactions'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate, formatDateTime } from '~/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShieldCheck } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const donorId = computed(() => route.params.id as string)

const { getDonorById, getDonorTransactionsById } = useDonors()

const donor = computed(() => getDonorById(donorId.value))
const donorTransactions = computed(() => getDonorTransactionsById(donorId.value))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Donors', href: '/admin/donors' },
  { label: donor.value?.name ?? 'Not Found' }
])

const avgDonation = computed(() => {
  if (!donor.value || donor.value.donationCount === 0) return 0
  return donor.value.totalDonated / donor.value.donationCount
})

const consentRecords = computed(() => getUserConsentRecords(donor.value?.email ?? ''))

const PURPOSE_LABELS: Record<string, string> = {
  marketing_email: 'Marketing Emails'
}

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`/admin/donations/${row.original.id}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!donor" class="py-12 text-center">
        <p class="text-muted-foreground">Donor not found.</p>
        <Button variant="outline" class="mt-4" @click="navigateTo('/admin/donors')">
          <ArrowLeft class="w-4 h-4 mr-2" />
          Back to Donors
        </Button>
      </div>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4">
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-2xl font-bold">{{ donor.name }}</h1>
              <Badge v-if="donor.isAnonymous" variant="secondary">Anonymous</Badge>
              <Badge v-if="donor.giftAid" variant="outline">Gift Aid</Badge>
            </div>
            <p class="text-sm text-muted-foreground">{{ donor.email }}</p>
          </div>
          <Button variant="outline" size="sm" @click="navigateTo('/admin/donors')">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <!-- Stats Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">
                {{ formatCurrency(donor.totalDonated, donor.currency, 0) }}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Donations</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ donor.donationCount }}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground"
                >Average Donation</CardTitle
              >
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatCurrency(avgDonation, donor.currency) }}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Last Donation</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-2xl font-bold">{{ formatDate(donor.lastDonationDate) }}</p>
            </CardContent>
          </Card>
        </div>

        <!-- Donation History -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Donation History</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              :columns="donationColumns"
              :data="donorTransactions"
              :show-pagination="donorTransactions.length > 10"
              :page-size="10"
              @row-click="handleRowClick"
            />
          </CardContent>
        </Card>

        <!-- Consent Records -->
        <Card class="mt-6">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <ShieldCheck class="h-4 w-4" />
              Consent Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="consentRecords.length === 0" class="text-sm text-muted-foreground">
              No consent records on file.
            </div>
            <div v-else class="space-y-3">
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
                  {{
                    record.wordingShown.length > 80
                      ? record.wordingShown.slice(0, 80) + '...'
                      : record.wordingShown
                  }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
