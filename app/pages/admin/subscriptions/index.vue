<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import AdminDataTable from '~/features/_admin/components/AdminDataTable.vue'
import { useAdminSubscriptions } from '~/features/subscriptions/admin/composables/useAdminSubscriptions'
import { subscriptionColumns } from '~/features/subscriptions/admin/columns/subscriptionColumns'
import { createViewActionColumn } from '~/features/_admin/columns/actionColumn'
import type { Subscription } from '~/features/subscriptions/shared/types'

definePageMeta({
  layout: 'admin'
})

const { allSubscriptions, stats } = useAdminSubscriptions()

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Subscriptions' }]

type EnrichedSubscription = Subscription & { donorName: string; donorEmail: string }

const columnsWithActions = computed(() => [
  ...subscriptionColumns,
  createViewActionColumn<EnrichedSubscription>((r) => `/admin/subscriptions/${r.id}`)
])

function handleRowClick(row: { original: EnrichedSubscription }) {
  navigateTo(`/admin/subscriptions/${row.original.id}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Subscriptions" :stats="stats" />

      <AdminDataTable
        :columns="columnsWithActions"
        :data="allSubscriptions"
        filter-column="donorName"
        filter-placeholder="Search by donor..."
        @row-click="handleRowClick"
      />
    </div>
  </div>
</template>
