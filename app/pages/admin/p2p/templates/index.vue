<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import P2PPresetPickerDialog from '~/features/campaigns/admin/components/P2PPresetPickerDialog.vue'
import type { P2PCampaignPreset } from '~/features/campaigns/admin/templates'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin'
})

const { campaigns, createCampaign } = useCampaigns()

const p2pCampaigns = computed(() => campaigns.value.filter((c) => c.type === 'p2p'))

const activeCampaigns = computed(() => p2pCampaigns.value.filter((c) => c.status === 'active'))

// Filtering
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' }
]

const activeStatusFilter = ref('all')

const statusCounts = computed(() => {
  const counts: Record<string, number> = { all: p2pCampaigns.value.length }
  for (const c of p2pCampaigns.value) counts[c.status] = (counts[c.status] ?? 0) + 1
  return counts
})

const filteredCampaigns = computed(() => {
  if (activeStatusFilter.value === 'all') return p2pCampaigns.value
  return p2pCampaigns.value.filter((c) => c.status === activeStatusFilter.value)
})

const totalRaised = computed(() =>
  p2pCampaigns.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
)

const totalDonations = computed(() =>
  p2pCampaigns.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
)

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
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Peer to Peer' },
  { label: 'Templates' }
]

const showP2PPresetDialog = ref(false)

const handleP2PPresetSelect = (preset: P2PCampaignPreset) => {
  const presetData = preset.factory()
  const campaignId = createCampaign(presetData)
  navigateTo(`/admin/p2p/templates/${campaignId}`)
}
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="P2P Templates" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="showP2PPresetDialog = true">
            <Plus class="w-4 h-4 mr-2" />
            New P2P Campaign
          </Button>
        </template>
      </AdminPageHeader>

      <div class="mb-4 flex flex-wrap items-center gap-4">
        <FilterTabs v-model="activeStatusFilter" :filters="statusFilters" :counts="statusCounts" />
      </div>

      <CampaignList :campaigns="filteredCampaigns" />
    </div>

    <P2PPresetPickerDialog v-model:open="showP2PPresetDialog" @select="handleP2PPresetSelect" />
  </div>
</template>
