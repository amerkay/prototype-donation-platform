<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
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
  // TODO: Replace with API call when Supabase is available
  const campaignId = createCampaign(presetData)
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
          <h1 class="text-3xl font-bold">P2P Templates</h1>
          <Button size="sm" @click="showP2PPresetDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            New P2P Campaign
          </Button>
        </div>
        <div class="flex gap-6 text-sm text-muted-foreground">
          <div>
            <span class="font-semibold text-foreground">{{ p2pCampaigns.length }}</span> total
            campaigns
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ activeCampaigns.length }}</span>
            active campaigns
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ totalFundraisers }}</span> total
            fundraisers
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ activeFundraisers }}</span> active
            fundraisers
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
      <CampaignList :campaigns="p2pCampaigns" />
    </div>

    <!-- P2P Preset Picker Dialog -->
    <P2PPresetPickerDialog v-model:open="showP2PPresetDialog" @select="handleP2PPresetSelect" />
  </div>
</template>
