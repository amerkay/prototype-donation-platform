<script setup lang="ts">
import AppSidebar from '~/features/_admin/sidebar/AppSidebar.vue'
import CompactCampaignHeader from '~/features/campaigns/donor/components/CompactCampaignHeader.vue'
import CampaignConfigPanel from '~/features/campaigns/admin/components/CampaignConfigPanel.vue'
import CrowdfundingPagePreview from '~/features/campaigns/donor/components/CrowdfundingPagePreview.vue'
import FundraisersTab from '~/features/campaigns/donor/components/FundraisersTab.vue'
import SharingTab from '~/features/campaigns/donor/components/SharingTab.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Settings, Users, Share2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { getCampaignById } = useCampaigns()
const store = useCampaignConfigStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect if campaign not found
if (!campaign.value) {
  navigateTo('/campaigns')
}

// Initialize store with campaign data
if (campaign.value) {
  store.initialize(campaign.value)
}

// Watch for campaign ID changes (navigation between campaigns)
watch(
  () => route.params.id,
  (newId) => {
    const newCampaign = getCampaignById(newId as string)
    if (newCampaign) {
      store.initialize(newCampaign)
    }
  }
)

// Active tab
const activeTab = ref('settings')

// Discard changes dialog
const showDiscardDialog = ref(false)

const handleDiscard = () => {
  showDiscardDialog.value = true
}

const confirmDiscard = () => {
  if (campaign.value) {
    store.initialize(campaign.value)
  }
  showDiscardDialog.value = false
}

// Navigation handlers
const handleEditForm = () => {
  router.push(`/campaigns/${store.id}/form-settings`)
}

const handlePreview = () => {
  window.open(`/preview/campaigns/${store.id}`, '_blank')
}
</script>

<template>
  <SidebarProvider v-if="campaign">
    <AppSidebar />
    <SidebarInset>
      <!-- Header with breadcrumbs -->
      <header class="flex h-14 shrink-0 items-center gap-2 border-b">
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
                <BreadcrumbPage>{{ store.name }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div class="flex flex-1 flex-col">
        <!-- Compact Campaign Header -->
        <div class="px-4 pt-4">
          <CompactCampaignHeader @edit-form="handleEditForm" @preview="handlePreview" />
        </div>

        <!-- Tabbed Content -->
        <div class="flex-1 px-4 pt-4">
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="mb-4">
              <TabsTrigger value="settings" class="gap-2">
                <Settings class="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="fundraisers" class="gap-2">
                <Users class="w-4 h-4" />
                Fundraisers
              </TabsTrigger>
              <TabsTrigger value="sharing" class="gap-2">
                <Share2 class="w-4 h-4" />
                Sharing
              </TabsTrigger>
            </TabsList>

            <!-- Settings Tab: Split Config/Preview -->
            <TabsContent value="settings" class="mt-0">
              <div class="flex-col-reverse flex gap-y-6 lg:gap-x-6 lg:flex-row">
                <!-- Left: Config Panel -->
                <div class="grow min-w-0 pb-4">
                  <p class="text-muted-foreground text-sm font-semibold mb-3">Campaign Settings</p>
                  <CampaignConfigPanel @discard="handleDiscard" />
                </div>

                <!-- Right: Crowdfunding Page Preview (sticky) -->
                <div
                  class="w-full sm:mx-auto lg:min-w-95 lg:max-w-95 lg:w-95 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto pb-4"
                >
                  <p class="text-muted-foreground text-sm font-semibold mb-3">
                    Crowdfunding Page Preview
                  </p>
                  <CrowdfundingPagePreview />
                </div>
              </div>
            </TabsContent>

            <!-- Fundraisers Tab -->
            <TabsContent value="fundraisers" class="mt-0">
              <FundraisersTab />
            </TabsContent>

            <!-- Sharing Tab -->
            <TabsContent value="sharing" class="mt-0">
              <SharingTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarInset>

    <!-- Discard Changes Dialog -->
    <AlertDialog v-model:open="showDiscardDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Are you sure you want to discard them? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmDiscard">Discard Changes</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </SidebarProvider>
</template>
