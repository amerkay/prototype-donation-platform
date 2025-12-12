<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next"
import {
    Folder,
    Forward,
    MoreHorizontal,
    Trash2,
} from "lucide-vue-next"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

defineProps<{
    campaigns: {
        name: string
        url: string
        icon: LucideIcon
        selected?: boolean
    }[]
}>()

const { isMobile } = useSidebar()
</script>

<template>
    <SidebarGroup class="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Recent Campaigns</SidebarGroupLabel>
        <SidebarMenu>
            <SidebarMenuItem v-for="item in campaigns" :key="item.name">
                <SidebarMenuButton as-child :variant="item.selected ? 'selected' : 'default'">
                    <a :href="item.url">
                        <component :is="item.icon" />
                        <span>{{ item.name }}</span>
                    </a>
                </SidebarMenuButton>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <SidebarMenuAction show-on-hover>
                            <MoreHorizontal />
                            <span class="sr-only">More</span>
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-48 rounded-lg" :side="isMobile ? 'bottom' : 'right'"
                        :align="isMobile ? 'end' : 'start'">
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
                <SidebarMenuButton>
                    <MoreHorizontal />
                    <span>More</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    </SidebarGroup>
</template>
