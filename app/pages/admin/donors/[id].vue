<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import DonorInfoCard from '~/features/_admin/components/DonorInfoCard.vue'
import TransactionHistoryCard from '~/features/_admin/components/TransactionHistoryCard.vue'
import CustomFieldsCard from '~/features/_admin/components/CustomFieldsCard.vue'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { subscriptionColumns } from '~/features/subscriptions/admin/columns/subscriptionColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import type { EnrichedSubscription } from '~/features/_admin/composables/useEntityDataService'
import { getUserConsentRecords } from '~/sample-api-responses/api-sample-response-transactions'
import { formatDateTime } from '~/lib/formatDate'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck } from 'lucide-vue-next'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const donorId = computed(() => route.params.id as string)

const { getDonorById, getDonorTransactionsById } = useDonors()
const { allSubscriptions } = useAdminSubscriptions()

const donor = computed(() => getDonorById(donorId.value))
const donorTransactions = computed(() => getDonorTransactionsById(donorId.value))

const donorSubscriptions = computed(() =>
  allSubscriptions.value.filter((s) => s.donorId === donorId.value)
)

const aggregatedCustomFields = computed(() => {
  const fields: Record<string, string> = {}
  for (const txn of donorTransactions.value) {
    if (txn.customFields) {
      Object.assign(fields, txn.customFields)
    }
  }
  return fields
})

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Donors', href: '/admin/donors' },
  { label: donor.value?.name ?? 'Not Found' }
])

const consentRecords = computed(() => getUserConsentRecords(donor.value?.email ?? ''))

const PURPOSE_LABELS: Record<string, string> = {
  marketing_email: 'Marketing Emails'
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <div v-if="!donor" class="py-12 text-center">
        <p class="text-muted-foreground">Donor not found.</p>
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
        </div>

        <!-- Info Cards Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <DonorInfoCard
            :donor-id="donor.id"
            :donor-name="donor.name"
            :donor-email="donor.email"
            :is-anonymous="donor.isAnonymous"
            :linkable="false"
          />

          <CustomFieldsCard
            v-if="Object.keys(aggregatedCustomFields).length"
            :custom-fields="aggregatedCustomFields"
          />

          <!-- Consent Records -->
          <Card>
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
        </div>

        <!-- Subscriptions -->
        <Card v-if="donorSubscriptions.length" class="mb-6">
          <CardHeader>
            <CardTitle class="text-base">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              :columns="[...subscriptionColumns, createViewActionColumn<EnrichedSubscription>((r) => `/admin/subscriptions/${r.id}`)]"
              :data="donorSubscriptions"
              :show-pagination="donorSubscriptions.length > 10"
              :page-size="10"
              @row-click="
                (row: { original: { id: string } }) =>
                  navigateTo(`/admin/subscriptions/${row.original.id}`)
              "
            />
          </CardContent>
        </Card>

        <!-- Donation History -->
        <TransactionHistoryCard :data="donorTransactions" title="Donation History" />
      </template>
    </div>
  </div>
</template>
