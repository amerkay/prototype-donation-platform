<script setup lang="ts">
import AdminListPage from '~/features/_admin/components/AdminListPage.vue'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { useDonationFilters } from '~/features/donations/admin/composables/useDonationFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import type { Transaction } from '~/features/donor-portal/types'

definePageMeta({
  layout: 'admin'
})

const { filteredTransactions, stats } = useDonations()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  resetFilters,
  filterItem
} = useDonationFilters(filteredTransactions)
const { isExporting, exportData } = useExport()

const displayedTransactions = computed(() => filteredTransactions.value.filter(filterItem))

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donations' }]

const columnsWithActions = computed(() => [
  ...donationColumns,
  createViewActionColumn<Transaction>((r) => `/admin/donations/${r.id}`)
])

const EXPORT_COLUMNS = [
  { key: 'createdAt', header: 'Date' },
  { key: 'donorName', header: 'Donor' },
  { key: 'donorEmail', header: 'Email' },
  { key: 'campaignName', header: 'Campaign' },
  { key: 'amount', header: 'Amount' },
  { key: 'currency', header: 'Currency' },
  { key: 'paymentMethod', header: 'Payment' },
  { key: 'type', header: 'Type' },
  { key: 'status', header: 'Status' },
  { key: 'giftAid', header: 'Gift Aid' }
]

function handleExport(format: 'csv' | 'xlsx') {
  const data = displayedTransactions.value.map((t) => ({
    createdAt: formatDate(t.createdAt),
    donorName: t.isAnonymous ? 'Anonymous' : t.donorName,
    donorEmail: t.donorEmail,
    campaignName: t.campaignName,
    amount: formatCurrency(t.totalAmount, t.currency),
    currency: t.currency,
    paymentMethod: paymentMethodLabel(t.paymentMethod),
    type: t.type === 'one_time' ? 'One-time' : 'Subscription',
    status: t.status,
    giftAid: t.giftAid ? 'Yes' : 'No'
  }))
  exportData({ data, columns: EXPORT_COLUMNS, format, filename: 'donations' })
}
</script>

<template>
  <AdminListPage
    v-model:filter-values="filterValues"
    title="Donations"
    :breadcrumbs="breadcrumbs"
    :stats="stats"
    :columns="columnsWithActions"
    :data="displayedTransactions"
    :filter-form="filterForm"
    :active-filter-count="activeFilterCount"
    filter-title="Donation Filters"
    filter-column="donorName"
    filter-placeholder="Search by donor..."
    :is-exporting="isExporting"
    row-base-path="/admin/donations"
    @reset-filters="resetFilters()"
  >
    <template #export-menu>
      <DropdownMenuItem @click="handleExport('csv')">Export CSV</DropdownMenuItem>
      <DropdownMenuItem @click="handleExport('xlsx')">Export XLSX</DropdownMenuItem>
    </template>
  </AdminListPage>
</template>
