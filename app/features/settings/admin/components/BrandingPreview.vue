<script setup lang="ts">
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-vue-next'
import DonationFlowWizard from '~/features/donation-form/donor/DonationFlowWizard.vue'
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import CertificatePreview from '~/features/templates/admin/components/CertificatePreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'

const { campaigns } = useCampaigns()
const { brandingStyle } = useBrandingCssVars()

const activeTab = ref('donation')

// Use first campaign with crowdfunding data for preview
const previewCampaign = computed(() => campaigns.value.find((c) => c.crowdfunding?.enabled))

const TABS = [
  { value: 'donation', label: 'Donation Form', link: '/admin/campaigns', linkLabel: 'Edit Forms' },
  { value: 'campaign', label: 'Campaign', link: '/admin/campaigns', linkLabel: 'Edit Campaigns' },
  {
    value: 'receipt',
    label: 'Receipt',
    link: '/admin/templates/receipts',
    linkLabel: 'Edit Receipt'
  },
  {
    value: 'certificate',
    label: 'Certificate',
    link: '/admin/templates/certificates',
    linkLabel: 'Edit Certificate'
  }
] as const
</script>

<template>
  <div class="space-y-3" :style="brandingStyle">
    <Tabs v-model="activeTab">
      <TabsList class="w-full">
        <TabsTrigger v-for="tab in TABS" :key="tab.value" :value="tab.value" class="text-xs">
          {{ tab.label }}
        </TabsTrigger>
      </TabsList>

      <!-- Donation Form — real DonationFlowWizard -->
      <TabsContent value="donation">
        <div class="bg-muted/50 rounded-xl border">
          <DonationFlowWizard />
        </div>
        <div class="flex justify-between text-xs text-muted-foreground px-1 mt-3">
          <span>Preview with current branding</span>
          <NuxtLink
            to="/admin/campaigns"
            class="flex items-center gap-1 text-primary hover:underline"
          >
            Edit Forms
            <ArrowRight class="size-3" />
          </NuxtLink>
        </div>
      </TabsContent>

      <!-- Campaign — real CrowdfundingPage -->
      <TabsContent value="campaign">
        <CrowdfundingPage v-if="previewCampaign" :campaign="previewCampaign" />
        <p v-else class="text-sm text-muted-foreground text-center py-8">
          No campaigns with crowdfunding pages yet.
        </p>
        <div class="flex justify-between text-xs text-muted-foreground px-1 mt-3">
          <span>Preview with current branding</span>
          <NuxtLink
            to="/admin/campaigns"
            class="flex items-center gap-1 text-primary hover:underline"
          >
            Edit Campaigns
            <ArrowRight class="size-3" />
          </NuxtLink>
        </div>
      </TabsContent>

      <!-- Receipt — embedded existing component -->
      <TabsContent value="receipt">
        <div class="space-y-3">
          <ReceiptPreview />
          <div class="flex justify-between text-xs text-muted-foreground px-1">
            <span>Preview with current branding</span>
            <NuxtLink
              to="/admin/templates/receipts"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Receipt
              <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </TabsContent>

      <!-- Certificate — embedded existing component -->
      <TabsContent value="certificate">
        <div class="space-y-3">
          <CertificatePreview />
          <div class="flex justify-between text-xs text-muted-foreground px-1">
            <span>Preview with current branding</span>
            <NuxtLink
              to="/admin/templates/certificates"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Certificate
              <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
