<script setup lang="ts">
import AppSidebar from '~/features/_admin/sidebar/AppSidebar.vue'
import AdminDonationFormConfig from '~/features/donation-form/admin/components/AdminDonationFormConfig.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
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
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const { getCampaignById } = useCampaigns()
const { getForm } = useForms(route.params.id as string)

const campaignId = route.params.id as string
const formId = route.params.formId as string

const campaign = computed(() => getCampaignById(campaignId))
const form = computed(() => getForm(formId))

// Redirect to campaigns if not found
if (!campaign.value || !form.value) {
  navigateTo('/admin/campaigns')
}

// Initialize store with form config
const store = useFormConfigStore()
if (form.value) {
  store.initialize(form.value.config, form.value.products)
}

// Watch for form changes
watch(
  () => form.value,
  (newForm) => {
    if (newForm) {
      store.initialize(newForm.config, newForm.products)
    }
  }
)

const handlePreview = () => {
  window.open(`/admin/campaigns/${campaignId}/forms/${formId}/preview`, '_blank')
}
</script>

<template>
  <SidebarProvider v-if="campaign && form">
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
                <BreadcrumbLink href="/admin/campaigns"> Campaigns </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbLink :href="`/admin/campaigns/${campaign.id}`">
                  {{ campaign.name }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{{ form.name }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col px-4 pt-0">
        <div class="flex-col-reverse flex gap-y-6 lg:space-x-4 lg:flex-row">
          <div class="grow pb-4">
            <!-- <p class="text-muted-foreground text-sm font-semibold mb-2">Form Settings</p> -->
            <AdminDonationFormConfig />
          </div>

          <div
            class="w-full sm:mx-auto lg:min-w-sm lg:max-w-sm lg:w-sm lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto pb-4"
          >
            <div class="flex items-center justify-between mb-2">
              <p class="text-muted-foreground text-sm font-semibold">Form Preview</p>
              <Button variant="outline" size="sm" @click="handlePreview">
                <ExternalLink class="w-4 h-4" />
              </Button>
            </div>
            <DonationFormPreview />
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
