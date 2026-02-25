<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  ICON_DASHBOARD,
  ICON_RECEIPT,
  ICON_SUBSCRIPTION,
  ICON_CAMPAIGN,
  ICON_DONATION,
  ICON_SUPPORT,
  ICON_SEND,
  ICON_DOWNLOAD
} from '~/lib/icons'
import NavUser from '~/features/_shared/sidebar/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset'
})

const route = useRoute()

const isActive = (url: string) => {
  if (url === '/portal') return route.path === '/portal' || route.path === '/portal/'
  return route.path === url || route.path.startsWith(url + '/')
}

const navItems = [
  { title: 'Dashboard', url: '/portal', icon: ICON_DASHBOARD },
  { title: 'Donation History', url: '/portal/donations', icon: ICON_RECEIPT },
  { title: 'Subscriptions', url: '/portal/subscriptions', icon: ICON_SUBSCRIPTION },
  { title: 'My Fundraisers', url: '/portal/fundraisers', icon: ICON_CAMPAIGN },
  { title: 'My Data', url: '/portal/my-data', icon: ICON_DOWNLOAD }
]

const navSecondary = [
  { title: 'Support', url: '#', icon: ICON_SUPPORT },
  { title: 'Feedback', url: '#', icon: ICON_SEND }
]

const user = {
  name: 'Wild Amer',
  email: 'awesome@charity.co.uk',
  avatar: '/avatar.png'
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/portal">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <ICON_DONATION class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Donor Portal</span>
                <span class="truncate text-xs">Wild Amer</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navItems" :key="item.url">
            <SidebarMenuButton
              as-child
              :tooltip="item.title"
              :variant="isActive(item.url) ? 'selected' : 'default'"
            >
              <NuxtLink :to="item.url">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
      <SidebarGroup class="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in navSecondary" :key="item.url">
            <SidebarMenuButton
              as-child
              size="sm"
              :class="{ 'opacity-50 pointer-events-none': item.url === '#' }"
            >
              <NuxtLink :to="item.url">
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="user" />
    </SidebarFooter>
  </Sidebar>
</template>
