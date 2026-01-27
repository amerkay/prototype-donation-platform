<script setup lang="ts">
import type { LucideIcon } from 'lucide-vue-next'
import { useActiveLink } from './composables/useActiveLink'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

defineProps<{
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}>()

const { isActive } = useActiveLink()
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem v-for="item in items" :key="item.title">
          <SidebarMenuButton
            as-child
            size="sm"
            :variant="isActive(item.url) ? 'selected' : 'default'"
            :class="{ 'opacity-50 pointer-events-none': item.url === '#' }"
          >
            <NuxtLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
