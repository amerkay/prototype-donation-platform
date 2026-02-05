<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { transactionColumns } from '~/features/donor-portal/columns/transactionColumns'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'

definePageMeta({
  layout: 'portal'
})

const { transactions } = useDonorPortal()
</script>

<template>
  <div>
    <AdminBreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'Donation History' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">Donation History</h1>
        <p class="text-sm text-muted-foreground">Every gift you've made, in one place.</p>
      </div>
      <DataTable :columns="transactionColumns" :data="transactions" :page-size="10" />
    </div>
  </div>
</template>
