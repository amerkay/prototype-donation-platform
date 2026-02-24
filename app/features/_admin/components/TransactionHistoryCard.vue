<script setup lang="ts">
import type { Transaction } from '~/features/donor-portal/types'
import { donationColumns } from '~/features/donations/admin/columns/donationColumns'
import { createViewActionColumn } from '~/features/_shared/utils/actionColumn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminDataTable from '~/features/_shared/components/DataTable.vue'

const props = withDefaults(
  defineProps<{
    data: Transaction[]
    title?: string
  }>(),
  {
    title: 'Transaction History'
  }
)

const columns = [
  ...donationColumns,
  createViewActionColumn<Transaction>((r) => `/admin/donations/${r.id}`)
]

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`/admin/donations/${row.original.id}`)
}
</script>

<template>
  <Card v-if="props.data.length">
    <CardHeader>
      <CardTitle class="text-base">{{ props.title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <AdminDataTable
        :columns="columns"
        :data="props.data"
        :show-pagination="props.data.length > 10"
        :page-size="10"
        @row-click="handleRowClick"
      />
    </CardContent>
  </Card>
</template>
