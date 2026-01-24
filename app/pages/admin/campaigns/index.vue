<script setup lang="ts">
import AppSidebar from '~/features/_admin/sidebar/AppSidebar.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

const { campaigns, activeCampaigns, totalRaisedAllCampaigns, totalDonationsAllCampaigns } =
  useCampaigns()

const formattedTotalRaised = computed(() => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalRaisedAllCampaigns.value)
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/"> Dashboard </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Campaigns</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div class="ml-auto">
            <Button size="sm">
              <Plus class="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
        <!-- Header Stats -->
        <div class="mb-6 space-y-2">
          <h1 class="text-3xl font-bold">Campaigns</h1>
          <div class="flex gap-6 text-sm text-muted-foreground">
            <div>
              <span class="font-semibold text-foreground">{{ campaigns.length }}</span> total
              campaigns
            </div>
            <div>
              <span class="font-semibold text-foreground">{{ activeCampaigns.length }}</span>
              active
            </div>
            <div>
              <span class="font-semibold text-foreground">{{ formattedTotalRaised }}</span> raised
            </div>
            <div>
              <span class="font-semibold text-foreground">{{ totalDonationsAllCampaigns }}</span>
              donations
            </div>
          </div>
        </div>

        <!-- Campaign List -->
        <CampaignList :campaigns="campaigns" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
