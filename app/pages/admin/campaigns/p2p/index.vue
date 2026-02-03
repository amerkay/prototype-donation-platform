<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import P2PPresetPickerDialog from '~/features/campaigns/admin/components/P2PPresetPickerDialog.vue'
import type { P2PCampaignPreset } from '~/features/campaigns/admin/templates'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const { campaigns, createCampaign } = useCampaigns()

// Filter P2P campaigns only
const p2pCampaigns = computed(() => campaigns.value.filter((c) => c.type === 'p2p'))

const activeCampaigns = computed(() => p2pCampaigns.value.filter((c) => c.status === 'active'))

const totalRaised = computed(() =>
  p2pCampaigns.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
)

const totalDonations = computed(() =>
  p2pCampaigns.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
)

// P2P-specific stats
const totalFundraisers = computed(() =>
  p2pCampaigns.value.reduce((sum, c) => sum + c.fundraisers.length, 0)
)

const activeFundraisers = computed(() =>
  p2pCampaigns.value.reduce(
    (sum, c) => sum + c.fundraisers.filter((f) => f.status === 'active').length,
    0
  )
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
  { value: p2pCampaigns.value.length, label: 'campaigns' },
  { value: activeCampaigns.value.length, label: 'active' },
  { value: totalFundraisers.value, label: 'fundraisers' },
  { value: activeFundraisers.value, label: 'active fundraisers' },
  { value: formattedTotalRaised.value, label: 'raised' },
  { value: totalDonations.value, label: 'donations' }
])

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Campaigns', href: '/admin/campaigns/p2p' },
  { label: 'P2P Templates' }
]

// P2P preset picker
const showP2PPresetDialog = ref(false)

const handleP2PPresetSelect = (preset: P2PCampaignPreset) => {
  // Generate campaign data from preset factory
  const presetData = preset.factory()
  const campaignId = createCampaign(presetData)
  navigateTo(`/admin/campaigns/${campaignId}`)
}
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="P2P Templates" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="showP2PPresetDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            New P2P Campaign
          </Button>
        </template>
      </AdminPageHeader>

      <CampaignList :campaigns="p2pCampaigns" />
    </div>

    <P2PPresetPickerDialog v-model:open="showP2PPresetDialog" @select="handleP2PPresetSelect" />
  </div>
</template>
