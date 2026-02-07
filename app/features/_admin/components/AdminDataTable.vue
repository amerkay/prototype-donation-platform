<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useVueTable
} from '@tanstack/vue-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { valueUpdater } from '@/components/ui/table/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-vue-next'
import { getCurrentInstance } from 'vue'

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageSize?: number
    showPagination?: boolean
    filterColumn?: string
    filterPlaceholder?: string
  }>(),
  {
    pageSize: 15,
    showPagination: true,
    filterPlaceholder: 'Search...'
  }
)

const emit = defineEmits<{
  'row-click': [row: { original: TData }]
}>()

const hasRowClick = computed(() => !!getCurrentInstance()?.vnode.props?.['onRow-click'])

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    }
  },
  initialState: {
    pagination: { pageSize: props.pageSize }
  }
})

const filterValue = computed({
  get: () =>
    props.filterColumn
      ? ((table.getColumn(props.filterColumn)?.getFilterValue() as string) ?? '')
      : '',
  set: (value) => {
    if (props.filterColumn) {
      table.getColumn(props.filterColumn)?.setFilterValue(value)
    }
  }
})
</script>

<template>
  <div>
    <div v-if="filterColumn" class="flex items-center py-4">
      <div class="relative w-full max-w-sm">
        <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input v-model="filterValue" :placeholder="filterPlaceholder" class="pl-8" />
      </div>
    </div>

    <div class="border rounded-md overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :class="hasRowClick ? 'cursor-pointer hover:bg-muted/50' : ''"
              @click="hasRowClick ? emit('row-click', row) : undefined"
            >
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div v-if="showPagination" class="flex items-center justify-between py-4">
      <span class="text-sm text-muted-foreground">
        {{ table.getFilteredRowModel().rows.length }} result(s). Page
        {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </span>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
