<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import AdminDateRangePicker from '~/features/_admin/components/AdminDateRangePicker.vue'
import { useDonations } from '~/features/donations/admin/composables/useDonations'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import type { Transaction } from '~/features/donor-portal/types'

definePageMeta({
  layout: 'admin'
})

const { filteredTransactions, dateRange, stats } = useDonations()

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donations' }]

const columnsWithActions = computed(() => [
  ...donationColumns,
  createViewActionColumn<Transaction>((r) => `/admin/donations/${r.id}`)
])

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`/admin/donations/${row.original.id}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Donations" :stats="stats" />

      <div class="pb-2">
        <AdminDateRangePicker v-model="dateRange" />
      </div>

      <AdminDataTable
        :columns="columnsWithActions"
        :data="filteredTransactions"
        filter-column="donorName"
        filter-placeholder="Search by donor..."
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
