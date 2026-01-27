<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import { ChevronRight } from 'lucide-vue-next'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useActiveLink } from './composables/useActiveLink'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

const props = defineProps<{
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    exact?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}>()

const { isActive } = useActiveLink()

const hasValidSubitems = (item: (typeof props.items)[number]) => {
  return item.items?.some((subItem) => subItem.url !== '#') ?? false
}

const isDisabled = (item: (typeof props.items)[number]) => {
  if (item.url !== '#') return false
  if (!item.items?.length) return true
  return !hasValidSubitems(item)
}

const shouldToggle = (item: (typeof props.items)[number]) => {
  return item.url === '#' && !!item.items?.length && hasValidSubitems(item)
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible v-for="item in items" :key="item.title" as-child :default-open="item.isActive">
        <SidebarMenuItem>
          <template v-if="shouldToggle(item)">
            <CollapsibleTrigger as-child>
              <SidebarMenuButton :tooltip="item.title">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
                <ChevronRight
                  class="ml-auto transition-transform duration-200 data-[state=open]:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </template>
          <template v-else>
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :variant="isActive(item.url, item.exact) ? 'selected' : 'default'"
              :class="{ 'opacity-50 pointer-events-none': isDisabled(item) }"
            >
              <NuxtLink :to="item.url">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
            <template v-if="item.items?.length">
              <CollapsibleTrigger as-child>
                <SidebarMenuAction class="data-[state=open]:rotate-90">
                  <ChevronRight />
                  <span class="sr-only">Toggle</span>
                </SidebarMenuAction>
              </CollapsibleTrigger>
            </template>
          </template>
          <CollapsibleContent v-if="item.items?.length">
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton
                  as-child
                  :variant="isActive(subItem.url) ? 'selected' : 'default'"
                  :class="{ 'opacity-50 pointer-events-none': subItem.url === '#' }"
                >
                  <NuxtLink :to="subItem.url">
                    <span>{{ subItem.title }}</span>
                  </NuxtLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
