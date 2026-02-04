<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  Megaphone,
  Heart,
  LifeBuoy,
  Send
} from 'lucide-vue-next'
import NavUser from '~/features/_admin/sidebar/NavUser.vue'
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
  { title: 'Dashboard', url: '/portal', icon: LayoutDashboard },
  { title: 'Donation History', url: '/portal/donations', icon: Receipt },
  { title: 'Subscriptions', url: '/portal/subscriptions', icon: CreditCard },
  { title: 'My Fundraisers', url: '/portal/fundraisers', icon: Megaphone }
]

const navSecondary = [
  { title: 'Support', url: '#', icon: LifeBuoy },
  { title: 'Feedback', url: '#', icon: Send }
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
                <Heart class="size-4" />
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
