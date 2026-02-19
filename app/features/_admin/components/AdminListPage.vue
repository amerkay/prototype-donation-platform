<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import type { ComposableForm } from '~/features/_library/form-builder/types'
import AdminBreadcrumbBar from './AdminBreadcrumbBar.vue'
import AdminPageHeader from './AdminPageHeader.vue'
import AdminDataTable from './AdminDataTable.vue'
import AdminDateRangePicker from './AdminDateRangePicker.vue'
import AdminFilterSheet from './AdminFilterSheet.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { useAdminDateRangeStore } from '~/features/_admin/stores/adminDateRange'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Filter, Download } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  breadcrumbs: Array<{ label: string; href?: string }>
  stats?: { value: string | number; label: string }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<any, any>[]
  data: unknown[]
  filterForm: ComposableForm
  filterValues: Record<string, unknown>
  activeFilterCount: number
  filterTitle: string
  filterColumn: string
  filterPlaceholder: string
  isExporting: boolean
  rowBasePath: string
}>()

const emit = defineEmits<{
  'update:filterValues': [value: Record<string, unknown>]
  'reset-filters': []
}>()

const dateStore = useAdminDateRangeStore()
const showFilters = ref(false)

function handleRowClick(row: { original: { id: string } }) {
  navigateTo(`${props.rowBasePath}/${row.original.id}`)
}

function handleResetFilters() {
  emit('reset-filters')
  showFilters.value = false
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader :title="title" :stats="stats">
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
                <slot name="export-menu" />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </template>
      </AdminPageHeader>

      <AdminDataTable
        :columns="columns"
        :data="data"
        :filter-column="filterColumn"
        :filter-placeholder="filterPlaceholder"
        @row-click="handleRowClick"
      />
    </div>

    <AdminFilterSheet
      :open="showFilters"
      :title="filterTitle"
      :active-count="activeFilterCount"
      @update:open="showFilters = $event"
      @reset="handleResetFilters"
    >
      <FormRenderer
        :model-value="filterValues"
        :section="filterForm"
        @update:model-value="emit('update:filterValues', $event)"
      />
    </AdminFilterSheet>
  </div>
</template>
