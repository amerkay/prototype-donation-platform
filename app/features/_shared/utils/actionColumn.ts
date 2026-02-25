import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/components/ui/button'
import { ICON_VIEW } from '~/lib/icons'

/** Appends a ghost Eye-icon button column that navigates to a detail URL */
export function createViewActionColumn<T>(getUrl: (row: T) => string): ColumnDef<T> {
  return {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: { original: T } }) =>
      h('div', { class: 'flex justify-end' }, [
        h(
          Button,
          {
            variant: 'ghost',
            size: 'icon',
            class: 'h-8 w-8',
            onClick: (e: Event) => {
              e.stopPropagation()
              navigateTo(getUrl(row.original))
            }
          },
          () => h(ICON_VIEW, { class: 'h-4 w-4' })
        )
      ])
  }
}
