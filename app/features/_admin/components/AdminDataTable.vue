<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Loader2 } from 'lucide-vue-next'
import { getCurrentInstance } from 'vue'

const searchQuery = defineModel<string>('searchQuery')

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageSize?: number
    showPagination?: boolean
    searchPlaceholder?: string
    isSearching?: boolean
    isLoading?: boolean
  }>(),
  {
    pageSize: 15,
    showPagination: true,
    searchPlaceholder: 'Search...',
    isSearching: false,
    isLoading: false
  }
)

const emit = defineEmits<{
  'row-click': [row: { original: TData }]
}>()

const hasRowClick = computed(() => !!getCurrentInstance()?.vnode.props?.['onRow-click'])

const sorting = ref<SortingState>([])

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
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  state: {
    get sorting() {
      return sorting.value
    }
  },
  initialState: {
    pagination: { pageSize: props.pageSize }
  }
})

const showSearch = computed(() => searchQuery.value !== undefined)
const SKELETON_ROWS = 5
</script>

<template>
  <div>
    <div v-if="showSearch" class="flex items-center py-4">
      <div class="relative w-full max-w-sm">
        <Search
          v-if="!isSearching"
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Loader2
          v-else
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin"
        />
        <Input v-model="searchQuery" :placeholder="searchPlaceholder" class="pl-8" />
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
          <template v-if="isLoading">
            <TableRow v-for="i in SKELETON_ROWS" :key="`skeleton-${i}`">
              <TableCell v-for="(_, colIdx) in columns" :key="colIdx">
                <Skeleton class="h-4 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
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

    <div v-if="showPagination && !isLoading" class="flex items-center justify-between py-4">
      <span class="text-sm text-muted-foreground">
        {{ table.getRowModel().rows.length }} result(s). Page
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
