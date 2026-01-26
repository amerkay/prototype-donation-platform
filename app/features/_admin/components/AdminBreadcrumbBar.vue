<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  /** Array of breadcrumb items. Last item is automatically the current page. */
  items: BreadcrumbItem[]
  /** Show "Unsaved" badge */
  isDirty?: boolean
}

defineProps<Props>()
</script>

<template>
  <header class="flex shrink-0 items-center gap-2 border-b mb-4 min-h-14 py-3">
    <div class="flex items-center gap-2 px-4 w-full flex-wrap">
      <SidebarTrigger class="-ml-1 mt-0.5" />
      <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4 mt-0.5" />
      <Breadcrumb class="flex-1 min-w-0">
        <BreadcrumbList>
          <!-- All items except last -->
          <template v-for="(item, index) in items.slice(0, -1)" :key="index">
            <BreadcrumbItem :class="index === 0 ? 'hidden md:block' : ''">
              <BreadcrumbLink v-if="item.href" :href="item.href">
                {{ item.label }}
              </BreadcrumbLink>
              <span v-else>{{ item.label }}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </template>

          <!-- Last item (current page) -->
          <BreadcrumbItem v-if="items.length > 0">
            <BreadcrumbPage>{{ items[items.length - 1]!.label }}</BreadcrumbPage>
          </BreadcrumbItem>

          <!-- Unsaved badge -->
          <Badge
            v-if="isDirty"
            variant="outline"
            class="shrink-0 text-xs text-orange-600 border-orange-300 ml-2"
          >
            Unsaved
          </Badge>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </header>
</template>
