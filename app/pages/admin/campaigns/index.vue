<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

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

const breadcrumbs = [{ label: 'Dashboard', href: '/' }, { label: 'Campaigns' }]
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <!-- Header Stats -->
      <div class="mb-6 space-y-2">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">Campaigns</h1>
          <Button size="sm">
            <Plus class="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
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
  </div>
</template>
