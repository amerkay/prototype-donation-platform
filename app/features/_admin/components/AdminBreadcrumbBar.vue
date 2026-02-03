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
import InlineEditableText from './InlineEditableText.vue'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface Props {
  /** Array of breadcrumb items. Last item is automatically the current page. */
  items: BreadcrumbItem[]
  /** Show "Unsaved" badge */
  isDirty?: boolean
  /** Allow editing the last breadcrumb item label */
  editableLastItem?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editableLastItem: false
})

const emit = defineEmits<{
  (e: 'update:lastItemLabel', value: string): void
}>()

const lastItem = computed(() =>
  props.items.length > 0 ? props.items[props.items.length - 1]! : null
)
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

          <!-- Last item (current page) - editable or static -->
          <BreadcrumbItem v-if="lastItem" class="min-w-0">
            <InlineEditableText
              v-if="editableLastItem"
              :model-value="lastItem.label"
              @update:model-value="emit('update:lastItemLabel', $event)"
            />
            <BreadcrumbPage v-else>{{ lastItem.label }}</BreadcrumbPage>
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
