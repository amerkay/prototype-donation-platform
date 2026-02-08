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

import NavMain from '~/features/_admin/sidebar/NavMain.vue'
import NavCampaigns from '~/features/_admin/sidebar/NavCampaigns.vue'
import NavSecondary from '~/features/_admin/sidebar/NavSecondary.vue'
import NavUser from '~/features/_admin/sidebar/NavUser.vue'
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

const navMain = computed(() => [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: 'Campaigns',
    url: '/admin/campaigns',
    icon: Megaphone,
    items: [
      {
        title: 'Standard',
        url: '/admin/campaigns/standard'
      },
      {
        title: 'P2P Templates',
        url: '/admin/campaigns/p2p'
      }
    ]
  },
  {
    title: 'Donors',
    url: '/admin/donors',
    icon: Users
  },
  {
    title: 'Donations',
    url: '/admin/donations',
    icon: PoundSterling
  },
  {
    title: 'Subscriptions',
    url: '/admin/subscriptions',
    icon: CreditCard
  },
  {
    title: 'Impact Products',
    url: '/admin/products',
    icon: Box
  },
  {
    title: 'Templates',
    url: '#',
    icon: FileText,
    items: [
      {
        title: 'Receipts',
        url: '/admin/templates/receipts'
      },
      {
        title: 'Certificates',
        url: '/admin/templates/certificates'
      },
      {
        title: 'eCards',
        url: '/admin/templates/ecards'
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
    disabled: true,
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
        url: '/admin/settings/general'
      },
      {
        title: 'Currency',
        url: '/admin/settings/currency'
      },
      {
        title: 'Charity',
        url: '/admin/settings/charity'
      },
      {
        title: 'Branding',
        url: '/admin/settings/branding'
      },
      {
        title: 'Payment Processors',
        url: '/admin/settings/payments'
      },
      {
        title: 'Team',
        url: '/admin/settings/team'
      },
      {
        title: 'Billing',
        url: '/admin/settings/billing'
      },
      {
        title: 'API & Webhooks',
        url: '/admin/settings/api'
      }
    ]
  }
])

const navSecondary = [
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

const data = {
  user: {
    name: 'Wild Amer',
    email: 'awesome@charity.co.uk',
    avatar: '/avatar.png'
  }
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
                <span class="truncate text-xs">Donations Stay Donations</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="navMain" />
      <NavCampaigns />
      <NavSecondary :items="navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
  </Sidebar>
</template>
