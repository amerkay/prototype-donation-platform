<script setup lang="ts">
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import AdminPageHeader from '~/features/_admin/components/AdminPageHeader.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import FilterTabs from '~/components/FilterTabs.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import CampaignCreateWizard from '~/features/campaigns/admin/components/CampaignCreateWizard.vue'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ICON_CREATE } from '~/lib/icons'

definePageMeta({ layout: 'admin' })

const { campaigns } = useCampaigns()

// Show all campaign types except P2P templates and fundraisers (they have dedicated pages)
const listableCampaigns = computed(() =>
  campaigns.value.filter((c) => c.type !== 'p2p' && c.type !== 'p2p-fundraiser')
)

const activeCampaigns = computed(() => listableCampaigns.value.filter((c) => c.status === 'active'))

const totalRaised = computed(() =>
  listableCampaigns.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
)

const totalDonations = computed(() =>
  listableCampaigns.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
)

// Filtering
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'ended', label: 'Ended' }
]

const activeStatusFilter = ref('all')
const showArchived = ref(false)

const statusCounts = computed(() => {
  const base = showArchived.value
    ? listableCampaigns.value
    : listableCampaigns.value.filter((c) => !c.isArchived)
  const counts: Record<string, number> = { all: base.length }
  for (const c of base) counts[c.status] = (counts[c.status] ?? 0) + 1
  return counts
})

const filteredCampaigns = computed(() => {
  let result = listableCampaigns.value
  if (!showArchived.value) result = result.filter((c) => !c.isArchived)
  if (activeStatusFilter.value !== 'all')
    result = result.filter((c) => c.status === activeStatusFilter.value)
  return result
})

const formattedTotalRaised = computed(() => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalRaised.value)
})

const stats = computed(() => [
  { value: listableCampaigns.value.length, label: 'campaigns' },
  { value: activeCampaigns.value.length, label: 'active' },
  { value: formattedTotalRaised.value, label: 'raised' },
  { value: totalDonations.value, label: 'donations' }
])

const breadcrumbs = [{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Campaigns' }]

const showCreateWizard = ref(false)
const handleNewCampaign = () => {
  showCreateWizard.value = true
}
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <AdminPageHeader title="Campaigns" :stats="stats">
        <template #action>
          <Button class="w-full sm:w-auto" size="sm" @click="handleNewCampaign">
            <ICON_CREATE class="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </template>
      </AdminPageHeader>

      <div class="mb-4 flex flex-wrap items-center gap-4">
        <FilterTabs v-model="activeStatusFilter" :filters="statusFilters" :counts="statusCounts" />
        <label class="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <Checkbox v-model="showArchived" />
          Show archived
        </label>
      </div>

      <CampaignList :campaigns="filteredCampaigns" />
    </div>

    <CampaignCreateWizard v-model:open="showCreateWizard" />
  </div>
</template>
