<script setup lang="ts">
import AppSidebar from '~/features/admin/sidebar/AppSidebar.vue'
import AdminDonationFormConfig from '~/features/admin/AdminDonationFormConfig.vue'
import DonationFormPreview from '~/features/admin/DonationFormPreview.vue'
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
import { formConfig as sampleConfig } from '~/sample-api-responses/api-sample-response-form-config'
import { products as sampleProducts } from '~/sample-api-responses/api-sample-response-products'
import { useFormConfigStore, type FullFormConfig } from '~/stores/formConfig'

const route = useRoute()
const { getCampaignById } = useCampaigns()

const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect to campaigns if not found
if (!campaign.value) {
  navigateTo('/campaigns')
}

// Initialize store with config
const store = useFormConfigStore()
store.initialize(sampleConfig as FullFormConfig, sampleProducts)
</script>

<template>
  <SidebarProvider v-if="campaign">
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4">
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
                <BreadcrumbPage>Form Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col px-4 pt-0">
        <div class="flex-col-reverse flex gap-y-6 lg:space-x-4 lg:flex-row">
          <div class="grow pb-4">
            <p class="text-muted-foreground text-sm font-semibold mb-2">Form Settings</p>
            <AdminDonationFormConfig />
          </div>

          <div
            class="w-full sm:mx-auto lg:min-w-sm lg:max-w-sm lg:w-sm lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto pb-4"
          >
            <p class="text-muted-foreground text-sm font-semibold mb-2">Form Preview</p>
            <DonationFormPreview />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
