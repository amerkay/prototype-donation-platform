<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminDataTable from '~/features/_shared/components/DataTable.vue'
import DonorInfoCard from '~/features/_admin/components/DonorInfoCard.vue'
import TransactionHistoryCard from '~/features/_admin/components/TransactionHistoryCard.vue'
import CustomFieldsCard from '~/features/_admin/components/CustomFieldsCard.vue'
import ConsentRecordsCard from '~/features/_admin/components/ConsentRecordsCard.vue'
import GiftAidCard from '~/features/_admin/components/GiftAidCard.vue'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { subscriptionColumns } from '~/features/subscriptions/admin/columns/subscriptionColumns'
import { createViewActionColumn } from '~/features/_shared/utils/actionColumn'
import type { EnrichedSubscription } from '~/features/_shared/utils/enrichSubscriptions'
import { useCompliance } from '~/features/_shared/composables/useCompliance'
import { aggregateCustomFields } from '~/features/_shared/utils/aggregateCustomFields'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const donorId = computed(() => route.params.id as string)

const { getDonorById, getDonorTransactionsById } = useDonors()
const { allSubscriptions } = useAdminSubscriptions()
const { getGiftAidDeclarations, getConsentRecords } = useCompliance()

const donor = computed(() => getDonorById(donorId.value))
const donorTransactions = computed(() => getDonorTransactionsById(donorId.value))

const donorSubscriptions = computed(() =>
  allSubscriptions.value.filter((s) => s.donorId === donorId.value)
)

const aggregatedCustomFields = computed(() => aggregateCustomFields(donorTransactions.value))

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Donors', href: '/admin/donors' },
  { label: donor.value?.name ?? 'Not Found' }
])

const consentRecords = computed(() => getConsentRecords(donor.value?.email ?? ''))
const giftAidDeclarations = computed(() => getGiftAidDeclarations(donor.value?.email ?? ''))
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbs" />

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
        <div class="grid gap-6 md:grid-cols-2 mb-6">
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

          <ConsentRecordsCard :records="consentRecords" />
          <GiftAidCard :declarations="giftAidDeclarations" />
        </div>

        <!-- Subscriptions -->
        <Card v-if="donorSubscriptions.length" class="mb-6">
          <CardHeader>
            <CardTitle class="text-base">Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              :columns="[
                ...subscriptionColumns,
                createViewActionColumn<EnrichedSubscription>((r) => `/admin/subscriptions/${r.id}`)
              ]"
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
