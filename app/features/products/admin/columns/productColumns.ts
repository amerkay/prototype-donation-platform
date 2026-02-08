import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { ImpactProduct } from '~/features/products/admin/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, Package } from 'lucide-vue-next'
import { formatCurrency } from '~/lib/formatCurrency'

import StatusBadge from '~/components/StatusBadge.vue'

const frequencyLabel: Record<string, string> = {
  once: 'One-time',
  monthly: 'Monthly',
  yearly: 'Yearly'
}

export const productColumns: ColumnDef<ImpactProduct>[] = [
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => {
      const image = row.original.image
      if (image) {
        return h('img', {
          src: image,
          alt: row.original.name,
          class: 'w-8 h-8 rounded-md object-cover'
        })
      }
      return h(
        'div',
        {
          class:
            'w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground'
        },
        [h(Package, { class: 'size-4' })]
      )
    },
    size: 50
  },
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
        h('span', { class: 'text-sm font-medium block' }, row.getValue('name') as string),
        h('span', { class: 'text-xs text-muted-foreground line-clamp-1' }, row.original.description)
      ])
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'secondary' },
        () => frequencyLabel[row.original.frequency] ?? row.original.frequency
      )
  },
  {
    id: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const p = row.original
      if (p.price) return h('span', { class: 'text-sm' }, formatCurrency(p.price, 'GBP'))
      if (p.minPrice) {
        return h('span', { class: 'text-sm' }, [
          `From ${formatCurrency(p.minPrice, 'GBP')}`,
          p.default
            ? h(
                'span',
                { class: 'text-muted-foreground' },
                ` (default ${formatCurrency(p.default, 'GBP')})`
              )
            : null
        ])
      }
      return h('span', { class: 'text-xs text-muted-foreground' }, 'Custom')
    }
  },
  {
    id: 'shipping',
    header: 'Shipping',
    cell: ({ row }) =>
      row.original.isShippingRequired
        ? h(Badge, { variant: 'outline', class: 'text-xs' }, () => [
            h(Package, { class: 'size-3 mr-1' }),
            'Required'
          ])
        : null
  },
  {
    accessorKey: 'linkedFormsCount',
    header: 'Linked Forms',
    cell: ({ row }) => h('span', { class: 'text-sm' }, `${row.original.linkedFormsCount} form(s)`)
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { status: row.original.status })
  }
]
