<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import AdminDateRangePicker from '~/features/_admin/components/AdminDateRangePicker.vue'
import AdminFilterSheet from '~/features/_admin/components/AdminFilterSheet.vue'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { useDonationFilters } from '~/features/donations/admin/composables/useDonationFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
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
import { paymentMethodLabel } from '~/lib/formatPaymentMethod'
import type { Transaction } from '~/features/donor-portal/types'

definePageMeta({
  layout: 'admin'
})

const dateStore = useAdminDateRangeStore()
const { filteredTransactions, stats } = useDonations()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  applyFilters,
  resetFilters,
  filterTransaction
} = useDonationFilters()
const { isExporting, exportData } = useExport()

const showFilters = ref(false)

const displayedTransactions = computed(() => filteredTransactions.value.filter(filterTransaction))

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donations' }]

const columnsWithActions = computed(() => [
  ...donationColumns,
  createViewActionColumn<Transaction>((r) => `/admin/donations/${r.id}`)
])

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`/admin/donations/${row.original.id}`)
}

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
      <AdminPageHeader title="Donations" :stats="stats">
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
        :data="displayedTransactions"
        filter-column="donorName"
        filter-placeholder="Search by donor..."
        @row-click="handleRowClick"
      />
    </div>

    <AdminFilterSheet
      :open="showFilters"
      title="Donation Filters"
      :active-count="activeFilterCount"
      @update:open="showFilters = $event"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    >
      <FormRenderer v-model="filterValues" :section="filterForm" />
    </AdminFilterSheet>
  </div>
</template>
