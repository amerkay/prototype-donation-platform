<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  ICON_DASHBOARD,
  ICON_CAMPAIGN,
  ICON_DONORS,
  ICON_P2P,
  ICON_DONATION,
  ICON_CURRENCY_GBP,
  ICON_SUBSCRIPTION,
  ICON_FORM,
  ICON_INTEGRATIONS,
  ICON_SETTINGS_2,
  ICON_SUPPORT,
  ICON_SEND,
  ICON_BOX
} from '~/lib/icons'

import NavMain from '~/features/_admin/sidebar/NavMain.vue'
import NavCampaigns from '~/features/_admin/sidebar/NavCampaigns.vue'
import NavSecondary from '~/features/_admin/sidebar/NavSecondary.vue'
import NavUser from '~/features/_shared/sidebar/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset'
})

// Close mobile sidebar on navigation
const { setOpenMobile } = useSidebar()
const route = useRoute()
watch(
  () => route.path,
  () => setOpenMobile(false)
)

const navMain = computed(() => [
  {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: ICON_DASHBOARD,
    exact: true
  },
  {
    title: 'Campaigns',
    url: '/admin/campaigns',
    icon: ICON_CAMPAIGN,
    exact: true
  },
  {
    title: 'Peer to Peer',
    url: '#',
    icon: ICON_P2P,
    items: [
      {
        title: 'Templates',
        url: '/admin/p2p/templates'
      },
      {
        title: 'Fundraiser Pages',
        url: '/admin/p2p/fundraisers'
      }
    ]
  },
  {
    title: 'Donors',
    url: '/admin/donors',
    icon: ICON_DONORS
  },
  {
    title: 'Donations',
    url: '/admin/donations',
    icon: ICON_CURRENCY_GBP
  },
  {
    title: 'Subscriptions',
    url: '/admin/subscriptions',
    icon: ICON_SUBSCRIPTION
  },
  {
    title: 'Impact Products',
    url: '/admin/products',
    icon: ICON_BOX
  },
  {
    title: 'Templates',
    url: '#',
    icon: ICON_FORM,
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
        title: 'Emails',
        url: '/admin/templates/emails'
      }
    ]
  },
  {
    title: 'Integrations',
    url: '#',
    icon: ICON_INTEGRATIONS,
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
    icon: ICON_SETTINGS_2,
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
        title: 'Social Sharing',
        url: '/admin/settings/social-sharing'
      },
      {
        title: 'After Sale Step',
        url: '/admin/settings/after-sale'
      },
      {
        title: 'Donor Portal',
        url: '/admin/settings/donor-portal'
      },
      {
        title: 'Gift Aid',
        url: '/admin/settings/gift-aid'
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
    icon: ICON_SUPPORT
  },
  {
    title: 'Feedback',
    url: '#',
    icon: ICON_SEND
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
                <ICON_DONATION class="size-4" />
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
