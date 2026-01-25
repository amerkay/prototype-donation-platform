<script setup lang="ts">
import AppSidebar from '~/features/_admin/sidebar/AppSidebar.vue'
import CompactCampaignHeader from '~/features/campaigns/admin/components/CompactCampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CampaignPreviewSwitcher from '~/features/campaigns/admin/components/CampaignPreviewSwitcher.vue'
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
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
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
import { Eye } from 'lucide-vue-next'

const route = useRoute()
const { getCampaignById } = useCampaigns()
const store = useCampaignConfigStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// Redirect if campaign not found
if (!campaign.value) {
  navigateTo('/admin/campaigns')
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
const handlePreview = () => {
  window.open(`/admin/campaigns/${store.id}/preview`, '_blank')
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
                <BreadcrumbLink href="/admin/campaigns"> Campaigns </BreadcrumbLink>
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
          <CompactCampaignHeader @preview="handlePreview" />
        </div>

        <!-- Main Content: Config Form (left) | Preview (right) -->
        <div class="flex-1 px-4 pt-4">
          <div class="flex-col-reverse flex gap-y-6 lg:gap-x-6 lg:flex-row">
            <!-- Left: Campaign Config with Accordions -->
            <div class="grow min-w-0 pb-4">
              <CampaignMasterConfigPanel @discard="handleDiscard" />
            </div>

            <!-- Right: Dynamic Preview (sticky) -->
            <div
              class="w-full sm:mx-auto lg:min-w-95 lg:max-w-95 lg:w-95 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto pb-4"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="text-muted-foreground text-sm font-semibold">Preview</p>
                <Button variant="outline" size="sm" @click="handlePreview">
                  <Eye class="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
              <CampaignPreviewSwitcher />
            </div>
          </div>
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
