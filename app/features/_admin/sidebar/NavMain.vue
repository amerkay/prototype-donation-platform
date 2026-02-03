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

interface Props {
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
}

const props = defineProps<Props>()

const route = useRoute()
const { isActive, hasActiveChild } = useActiveLink()

const isItemActive = (item: Props['items'][number]) => {
  return isActive(item.url, item.exact) || hasActiveChild(item.items)
}

// Track open state per item; auto-expand parents when navigating to child routes
const openStates = reactive<Record<string, boolean>>({})
watch(
  () => route.path,
  () => {
    for (const item of props.items) {
      if (isItemActive(item)) openStates[item.title] = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
        v-for="item in items"
        :key="item.title"
        as-child
        v-model:open="openStates[item.title]"
      >
        <SidebarMenuItem>
          <!-- Toggle-only: no URL, button itself toggles subitems -->
          <CollapsibleTrigger v-if="item.url === '#' && item.items?.length" as-child>
            <SidebarMenuButton
              :tooltip="item.title"
              :variant="isItemActive(item) ? 'selected' : 'default'"
              :class="
                isItemActive(item)
                  ? 'data-[state=open]:hover:bg-primary/90 data-[state=open]:hover:text-primary-foreground'
                  : ''
              "
            >
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
              <ChevronRight
                class="ml-auto transition-transform duration-200 group-data-[state=open]/menu-item:rotate-90"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <!-- Navigable: button links, separate action toggles subitems -->
          <template v-else>
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :variant="isItemActive(item) ? 'selected' : 'default'"
              :class="{ 'opacity-50 pointer-events-none': item.url === '#' }"
            >
              <NuxtLink :to="item.url">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
            <CollapsibleTrigger v-if="item.items?.length" as-child>
              <SidebarMenuAction class="data-[state=open]:rotate-90">
                <ChevronRight />
                <span class="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </template>
          <CollapsibleContent v-if="item.items?.length">
            <SidebarMenuSub>
              <SidebarMenuSubItem v-for="subItem in item.items" :key="subItem.title">
                <SidebarMenuSubButton
                  as-child
                  :is-active="isActive(subItem.url)"
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
