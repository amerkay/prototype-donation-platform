<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { transactionColumns } from '~/features/donor-portal/columns/transactionColumns'

definePageMeta({
  layout: 'portal'
})

const { transactions } = useDonorPortal()
</script>

<template>
  <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
    <div class="py-4 space-y-1">
      <h1 class="text-xl font-semibold tracking-tight">Donation History</h1>
      <p class="text-sm text-muted-foreground">All your past payments and donations.</p>
    </div>
    <DataTable :columns="transactionColumns" :data="transactions" :page-size="10" />
  </div>
</template>
