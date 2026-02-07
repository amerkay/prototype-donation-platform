import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { Donor } from '~/features/donors/admin/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'

export const donorColumns: ColumnDef<Donor>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          class: '-ml-2.5',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Name', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('div', {}, [
        h('span', { class: 'text-sm font-medium' }, row.getValue('name') as string),
        h('span', { class: 'text-xs text-muted-foreground block' }, row.original.email)
      ])
  },
  {
    accessorKey: 'donationCount',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Donations', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) => h('span', { class: 'text-sm' }, row.getValue('donationCount') as number)
  },
  {
    accessorKey: 'totalDonated',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Total Donated', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'text-sm font-medium' },
        formatCurrency(row.original.totalDonated, row.original.currency)
      )
  },
  {
    accessorKey: 'lastDonationDate',
    header: ({ column }) =>
      h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
        },
        () => ['Last Donation', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      ),
    cell: ({ row }) =>
      h('span', { class: 'text-sm' }, formatDate(row.getValue('lastDonationDate') as string))
  },
  {
    accessorKey: 'giftAid',
    header: 'Gift Aid',
    cell: ({ row }) =>
      row.original.giftAid
        ? h(Badge, { variant: 'outline', class: 'text-xs' }, () => 'Eligible')
        : h('span', { class: 'text-xs text-muted-foreground' }, '—')
  }
]
