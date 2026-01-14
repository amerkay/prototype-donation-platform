<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  LayoutDashboard,
  Megaphone,
  Users,
  Heart,
  PoundSterling,
  CreditCard,
  FileText,
  Plug,
  Settings2,
  LifeBuoy,
  Send,
  Box
} from 'lucide-vue-next'

import NavMain from '~/features/admin/sidebar/NavMain.vue'
import NavCampaigns from '~/features/admin/sidebar/NavCampaigns.vue'
import NavSecondary from '~/features/admin/sidebar/NavSecondary.vue'
import NavUser from '~/features/admin/sidebar/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset'
})

const data = {
  user: {
    name: 'Wild Amer',
    email: 'awesome@charity.co.uk',
    avatar: '/avatar.png'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: LayoutDashboard,
      isActive: true
    },
    {
      title: 'Campaigns',
      url: '/campaigns',
      icon: Megaphone,
      exact: true
    },
    {
      title: 'Donors',
      url: '#',
      icon: Users
    },
    {
      title: 'Donations',
      url: '#',
      icon: PoundSterling
    },
    {
      title: 'Subscriptions',
      url: '#',
      icon: CreditCard
    },
    {
      title: 'Products',
      url: '#',
      icon: Box
    },
    {
      title: 'Templates',
      url: '#',
      icon: FileText,
      items: [
        {
          title: 'Receipts',
          url: '#'
        },
        {
          title: 'Certificates',
          url: '#'
        },
        {
          title: 'eCards',
          url: '#'
        },
        {
          title: 'Pages',
          url: '#'
        }
      ]
    },
    {
      title: 'Integrations',
      url: '#',
      icon: Plug,
      items: [
        {
          title: 'Payments',
          url: '#'
        },
        {
          title: 'CRM',
          url: '#'
        },
        {
          title: 'Email',
          url: '#'
        },
        {
          title: 'Automation',
          url: '#'
        },
        {
          title: 'WordPress',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Currency',
          url: '#'
        },
        {
          title: 'Branding',
          url: '#'
        },
        {
          title: 'Payment Processors',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'API & Webhooks',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send
    }
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <Heart class="size-4" />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Borneo Orangutan Survival Foundations</span>
                <span class="truncate text-xs">Donation Platform</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavCampaigns />
      <NavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>
