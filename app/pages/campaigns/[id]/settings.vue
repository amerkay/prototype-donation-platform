<script setup lang="ts">
import AppSidebar from '~/features/admin/sidebar/AppSidebar.vue'
import CampaignSettings from '~/features/campaigns/components/CampaignSettings.vue'
import { useCampaigns } from '~/features/campaigns/composables/useCampaigns'
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
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const { getCampaignById } = useCampaigns()

const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect if campaign not found
if (!campaign.value) {
  navigateTo('/campaigns')
}
</script>

<template>
  <SidebarProvider v-if="campaign">
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
                <BreadcrumbLink href="/campaigns"> Campaigns </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink :href="`/campaigns/${campaign.id}`">
                  {{ campaign.name }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div class="ml-auto">
            <Button variant="outline" size="sm" as-child>
              <NuxtLink :to="`/campaigns/${campaign.id}`">
                <ArrowLeft class="w-4 h-4 mr-2" />
                Back to Campaign
              </NuxtLink>
            </Button>
          </div>
        </div>
      </header>

      <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold">Campaign Settings</h1>
          <p class="text-muted-foreground mt-1">
            Configure {{ campaign.name }} campaign settings and preferences
          </p>
        </div>

        <!-- Settings Form -->
        <CampaignSettings :campaign="campaign" />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
