<script setup lang="ts">
import AdminListPage from '~/features/_admin/components/AdminListPage.vue'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { useSubscriptionFilters } from '~/features/subscriptions/admin/composables/useSubscriptionFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { subscriptionColumns } from '~/features/subscriptions/admin/columns/subscriptionColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import type { Subscription } from '~/features/subscriptions/shared/types'

definePageMeta({
  layout: 'admin'
})

type EnrichedSubscription = Subscription & { donorName: string; donorEmail: string }

const { allSubscriptions, stats } = useAdminSubscriptions()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  resetFilters,
  filterItem
} = useSubscriptionFilters()
const { isExporting, exportData } = useExport()

const displayedSubscriptions = computed(() => allSubscriptions.value.filter(filterItem))

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Subscriptions' }]

const columnsWithActions = computed(() => [
  ...subscriptionColumns,
  createViewActionColumn<EnrichedSubscription>((r) => `/admin/subscriptions/${r.id}`)
])

const EXPORT_COLUMNS = [
  { key: 'donorName', header: 'Donor' },
  { key: 'donorEmail', header: 'Email' },
  { key: 'campaignName', header: 'Campaign' },
  { key: 'amount', header: 'Amount' },
  { key: 'frequency', header: 'Frequency' },
  { key: 'status', header: 'Status' },
  { key: 'totalPaid', header: 'Lifetime Value' },
  { key: 'nextBillingDate', header: 'Next Billing' }
]

function handleExport(format: 'csv' | 'xlsx') {
  const data = displayedSubscriptions.value.map((s) => ({
    donorName: s.donorName,
    donorEmail: s.donorEmail,
    campaignName: s.campaignName,
    amount: formatCurrency(s.amount, s.currency),
    frequency: s.frequency,
    status: s.status,
    totalPaid: formatCurrency(s.totalPaid, s.currency),
    nextBillingDate: s.nextBillingDate ? formatDate(s.nextBillingDate) : '—'
  }))
  exportData({ data, columns: EXPORT_COLUMNS, format, filename: 'subscriptions' })
}
</script>

<template>
  <AdminListPage
    v-model:filter-values="filterValues"
    title="Subscriptions"
    :breadcrumbs="breadcrumbs"
    :stats="stats"
    :columns="columnsWithActions"
    :data="displayedSubscriptions"
    :filter-form="filterForm"
    :active-filter-count="activeFilterCount"
    filter-title="Subscription Filters"
    filter-column="donorName"
    filter-placeholder="Search by donor..."
    :is-exporting="isExporting"
    row-base-path="/admin/subscriptions"
    @reset-filters="resetFilters()"
  >
    <template #export-menu>
      <DropdownMenuItem @click="handleExport('csv')">Export CSV</DropdownMenuItem>
      <DropdownMenuItem @click="handleExport('xlsx')">Export XLSX</DropdownMenuItem>
    </template>
  </AdminListPage>
</template>
