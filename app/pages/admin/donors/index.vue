<script setup lang="ts">
import AdminListPage from '~/features/_admin/components/AdminListPage.vue'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { useDonorFilters } from '~/features/donors/admin/composables/useDonorFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { useQuickFind } from '~/features/_admin/composables/useQuickFind'
import { useEntityDataService } from '~/features/_admin/composables/useEntityDataService'
import { donorColumns } from '~/features/donors/admin/columns/donorColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import type { Donor } from '~/features/donors/admin/types'

definePageMeta({
  layout: 'admin'
})

const { isLoading: entityLoading } = useEntityDataService()
const { donors, stats } = useDonors()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  resetFilters,
  filterItem
} = useDonorFilters()
const { isExporting, exportData } = useExport()

const conditionFiltered = computed(() => donors.value.filter(filterItem))

const {
  query: searchQuery,
  results: displayedDonors,
  isSearching
} = useQuickFind(conditionFiltered, ['name', 'email'])

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donors' }]

const columnsWithActions = computed(() => [
  ...donorColumns,
  createViewActionColumn<Donor>((r) => `/admin/donors/${r.id}`)
])

const EXPORT_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'totalDonated', header: 'Total Donated' },
  { key: 'donationCount', header: 'Donations' },
  { key: 'lastDonationDate', header: 'Last Donation' },
  { key: 'giftAid', header: 'Gift Aid' },
  { key: 'currency', header: 'Currency' }
]

function handleExport(format: 'csv' | 'xlsx') {
  const data = displayedDonors.value.map((d) => ({
    name: d.name,
    email: d.email,
    totalDonated: formatCurrency(d.totalDonated, d.currency),
    donationCount: d.donationCount,
    lastDonationDate: formatDate(d.lastDonationDate),
    giftAid: d.giftAid ? 'Yes' : 'No',
    currency: d.currency
  }))
  exportData({ data, columns: EXPORT_COLUMNS, format, filename: 'donors' })
}
</script>

<template>
  <AdminListPage
    v-model:filter-values="filterValues"
    v-model:search-query="searchQuery"
    title="Donors"
    :breadcrumbs="breadcrumbs"
    :stats="stats"
    :columns="columnsWithActions"
    :data="displayedDonors"
    :filter-form="filterForm"
    :active-filter-count="activeFilterCount"
    filter-title="Donor Filters"
    search-placeholder="Search donors..."
    :is-searching="isSearching"
    :is-loading="entityLoading"
    :is-exporting="isExporting"
    row-base-path="/admin/donors"
    @reset-filters="resetFilters()"
  >
    <template #export-menu>
      <DropdownMenuItem @click="handleExport('csv')">Export CSV</DropdownMenuItem>
      <DropdownMenuItem @click="handleExport('xlsx')">Export XLSX</DropdownMenuItem>
    </template>
  </AdminListPage>
</template>
