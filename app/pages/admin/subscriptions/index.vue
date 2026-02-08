<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import AdminDateRangePicker from '~/features/_admin/components/AdminDateRangePicker.vue'
import AdminFilterSheet from '~/features/_admin/components/AdminFilterSheet.vue'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { useSubscriptionFilters } from '~/features/subscriptions/admin/composables/useSubscriptionFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { subscriptionColumns } from '~/features/subscriptions/admin/columns/subscriptionColumns'
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
import type { Subscription } from '~/features/subscriptions/shared/types'

definePageMeta({
  layout: 'admin'
})

type EnrichedSubscription = Subscription & { donorName: string; donorEmail: string }

const dateStore = useAdminDateRangeStore()
const { allSubscriptions, stats } = useAdminSubscriptions()
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  applyFilters,
  resetFilters,
  filterSubscription
} = useSubscriptionFilters()
const { isExporting, exportData } = useExport()

const showFilters = ref(false)

const displayedSubscriptions = computed(() => allSubscriptions.value.filter(filterSubscription))

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Subscriptions' }]

const columnsWithActions = computed(() => [
  ...subscriptionColumns,
  createViewActionColumn<EnrichedSubscription>((r) => `/admin/subscriptions/${r.id}`)
])

function handleRowClick(row: { original: EnrichedSubscription }) {
  navigateTo(`/admin/subscriptions/${row.original.id}`)
}

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
      <AdminPageHeader title="Subscriptions" :stats="stats">
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
        :data="displayedSubscriptions"
        filter-column="donorName"
        filter-placeholder="Search by donor..."
        @row-click="handleRowClick"
      />
    </div>

    <AdminFilterSheet
      :open="showFilters"
      title="Subscription Filters"
      :active-count="activeFilterCount"
      @update:open="showFilters = $event"
      @apply="handleApplyFilters"
      @reset="handleResetFilters"
    >
      <FormRenderer v-model="filterValues" :section="filterForm" />
    </AdminFilterSheet>
  </div>
</template>
