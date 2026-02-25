<script setup lang="ts">
import { ICON_SHARE, ICON_FOLDER, ICON_MORE_ACTIONS, ICON_DELETE, ICON_CAMPAIGN } from '~/lib/icons'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { getCampaignEditPath } from '~/features/campaigns/shared/composables/useCampaignTypes'
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
    url: getCampaignEditPath(c.type, c.id)
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
            <ICON_CAMPAIGN />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <ICON_MORE_ACTIONS />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem>
              <ICON_FOLDER class="text-muted-foreground" />
              <span>View Campaign</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <ICON_SHARE class="text-muted-foreground" />
              <span>Share Campaign</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ICON_DELETE class="text-muted-foreground" />
              <span>Delete Campaign</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton as-child>
          <NuxtLink to="/admin/campaigns">
            <ICON_MORE_ACTIONS />
            <span>View All</span>
          </NuxtLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
