<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
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

const stats = computed(() => [
  { value: standardCampaigns.value.length, label: 'campaigns' },
  { value: activeCampaigns.value.length, label: 'active' },
  { value: formattedTotalRaised.value, label: 'raised' },
  { value: totalDonations.value, label: 'donations' }
])

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Campaigns', href: '/admin/campaigns/standard' },
  { label: 'Standard' }
]

const handleNewCampaign = () => {
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
      <AdminPageHeader title="Standard Campaigns" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="handleNewCampaign">
            <Plus class="w-4 h-4 mr-2" />
            New Standard Campaign
          </Button>
        </template>
      </AdminPageHeader>

      <CampaignList :campaigns="standardCampaigns" />
    </div>
  </div>
</template>
