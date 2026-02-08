<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import AdminDateRangePicker from '~/features/_admin/components/AdminDateRangePicker.vue'
import AdminFilterSheet from '~/features/_admin/components/AdminFilterSheet.vue'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { useDonorFilters } from '~/features/donors/admin/composables/useDonorFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { donorColumns } from '~/features/donors/admin/columns/donorColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Filter, Download } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import type { Donor } from '~/features/donors/admin/types'

definePageMeta({
  layout: 'admin'
})

const dateStore = useAdminDateRangeStore()
const { donors, stats } = useDonors()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  applyFilters,
  resetFilters,
  filterDonor
} = useDonorFilters()
const { isExporting, exportData } = useExport()

const showFilters = ref(false)

const displayedDonors = computed(() => donors.value.filter(filterDonor))

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donors' }]

const columnsWithActions = computed(() => [
  ...donorColumns,
  createViewActionColumn<Donor>((r) => `/admin/donors/${r.id}`)
])

function handleRowClick(row: { original: Donor }) {
  navigateTo(`/admin/donors/${row.original.id}`)
}

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

function handleApplyFilters() {
  applyFilters()
  showFilters.value = false
}

function handleResetFilters() {
  resetFilters()
  showFilters.value = false
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Donors" :stats="stats">
        <template #action>
          <div class="flex items-center gap-2">
            <AdminDateRangePicker v-model="dateStore.dateRange" />

            <Button variant="outline" size="sm" @click="showFilters = true">
              <Filter class="mr-2 h-4 w-4" />
              Filters
              <Badge v-if="activeFilterCount" variant="secondary" class="ml-1.5 text-xs">
                {{ activeFilterCount }}
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" :disabled="isExporting">
                  <Download class="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click="handleExport('csv')">Export CSV</DropdownMenuItem>
                <DropdownMenuItem @click="handleExport('xlsx')">Export XLSX</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
      </AdminPageHeader>

      <AdminDataTable
        :columns="columnsWithActions"
        :data="displayedDonors"
        filter-column="name"
        filter-placeholder="Search donors..."
        @row-click="handleRowClick"
      />
    </div>

    <AdminFilterSheet
      :open="showFilters"
      title="Donor Filters"
      :active-count="activeFilterCount"
      @update:open="showFilters = $event"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    >
      <FormRenderer v-model="filterValues" :section="filterForm" />
    </AdminFilterSheet>
  </div>
</template>
