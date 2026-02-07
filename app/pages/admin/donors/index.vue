<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import { useDonors } from '~/features/donors/admin/composables/useDonors'
import { donorColumns } from '~/features/donors/admin/columns/donorColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import type { Donor } from '~/features/donors/admin/types'

definePageMeta({
  layout: 'admin'
})

const { donors, stats } = useDonors()

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Donors' }]

const columnsWithActions = computed(() => [
  ...donorColumns,
  createViewActionColumn<Donor>((r) => `/admin/donors/${r.id}`)
])

function handleRowClick(row: { original: Donor }) {
  navigateTo(`/admin/donors/${row.original.id}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Donors" :stats="stats" />

      <AdminDataTable
        :columns="columnsWithActions"
        :data="donors"
        filter-column="name"
        filter-placeholder="Search donors..."
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
