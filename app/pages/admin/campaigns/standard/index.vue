<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const { campaigns, createCampaign } = useCampaigns()

// Filter standard campaigns only
const standardCampaigns = computed(() => campaigns.value.filter((c) => c.type === 'standard'))

const activeCampaigns = computed(() => standardCampaigns.value.filter((c) => c.status === 'active'))

const totalRaised = computed(() =>
  standardCampaigns.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
)

const totalDonations = computed(() =>
  standardCampaigns.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
)

const formattedTotalRaised = computed(() => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalRaised.value)
})

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Campaigns', href: '/admin/campaigns/standard' },
  { label: 'Standard' }
]

const handleNewCampaign = () => {
  // TODO: Replace with API call when Supabase is available
  const campaignId = createCampaign({
    type: 'standard',
    name: 'New Campaign'
  })
  navigateTo(`/admin/campaigns/${campaignId}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <!-- Header Stats -->
      <div class="mb-6 space-y-2">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">Standard Campaigns</h1>
          <Button size="sm" @click="handleNewCampaign">
            <Plus class="w-4 h-4 mr-2" />
            New Standard Campaign
          </Button>
        </div>
        <div class="flex gap-6 text-sm text-muted-foreground">
          <div>
            <span class="font-semibold text-foreground">{{ standardCampaigns.length }}</span> total
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ activeCampaigns.length }}</span>
            active
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ formattedTotalRaised }}</span> raised
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ totalDonations }}</span>
            donations
          </div>
        </div>
      </div>

      <!-- Campaign List -->
      <CampaignList :campaigns="standardCampaigns" />
    </div>
  </div>
</template>
