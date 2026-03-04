<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import P2PPresetPickerDialog from '~/features/campaigns/features/p2p/admin/components/P2PPresetPickerDialog.vue'
import type { P2PCampaignPreset } from '~/features/campaigns/features/p2p/admin/templates'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import { TEMPLATE_REGISTRY } from '~/features/donation-form/admin/templates'
import { Button } from '@/components/ui/button'
import { ICON_CREATE } from '~/lib/icons'

definePageMeta({
  layout: 'admin'
})

const { campaigns, createCampaign, updateCampaign } = useCampaigns()
const { createFormFromTemplate } = useCreateFormFromTemplate()

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

  // Auto-create a Basic donation form with recurring disabled for P2P
  const basicTemplate = TEMPLATE_REGISTRY.find((t) => t.metadata.id === 'basic')!
  const currency = presetData.crowdfunding?.currency || 'GBP'
  const { formId, formName, config, products } = createFormFromTemplate(
    campaignId,
    basicTemplate,
    [],
    currency,
    'p2p'
  )
  updateCampaign(campaignId, {
    form: {
      id: formId,
      campaignId,
      name: formName,
      isDefault: true,
      config,
      products,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })

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
            <ICON_CREATE class="w-4 h-4 mr-2" />
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
