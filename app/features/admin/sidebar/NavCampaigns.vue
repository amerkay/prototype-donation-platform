<script setup lang="ts">
import { Folder, Forward, MoreHorizontal, Trash2, Megaphone } from 'lucide-vue-next'
import { useCampaigns } from '~/features/campaigns/composables/useCampaigns'
import { useActiveLink } from './composables/useActiveLink'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'

const { isMobile } = useSidebar()
const { getRecentCampaigns } = useCampaigns()
const { isActive } = useActiveLink()

const campaigns = computed(() =>
  getRecentCampaigns(3).map((c) => ({
    name: c.name,
    url: `/campaigns/${c.id}`
  }))
)
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Recent Campaigns</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in campaigns" :key="item.name">
        <SidebarMenuButton as-child :variant="isActive(item.url) ? 'selected' : 'default'">
          <NuxtLink :to="item.url">
            <Megaphone />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem>
              <Folder class="text-muted-foreground" />
              <span>View Campaign</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>Share Campaign</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>Delete Campaign</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink to="/campaigns">
            <MoreHorizontal />
            <span>View All</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
