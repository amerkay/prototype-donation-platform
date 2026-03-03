<script setup lang="ts">
import AdminListPage from '~/features/_admin/components/AdminListPage.vue'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useFundraisers } from '~/features/campaigns/features/p2p/admin/composables/useFundraisers'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useFundraiserFilters } from '~/features/campaigns/features/p2p/admin/composables/useFundraiserFilters'
import { useExport } from '~/features/_admin/composables/useExport'
import { useQuickFind } from '~/features/_admin/composables/useQuickFind'
import { fundraiserColumns } from '~/features/campaigns/features/p2p/admin/columns/fundraiserColumns'
import { createViewActionColumn } from '~/features/_shared/utils/actionColumn'
import { formatCurrency } from '~/lib/formatCurrency'
import { formatDate } from '~/lib/formatDate'
import type { CampaignFundraiser } from '~/features/campaigns/shared/types'

definePageMeta({ layout: 'admin' })

const { allFundraisers, getParentName, stats } = useFundraisers()
const { getCampaignById } = useCampaigns()
const getCampaignPageTitle = (id: string) => getCampaignById(id)?.crowdfunding.title ?? 'Unknown'
const {
  form: filterForm,
  filterValues,
  activeFilterCount,
  resetFilters,
  filterItem
} = useFundraiserFilters()
const { isExporting, exportData } = useExport()

const conditionFiltered = computed(() => allFundraisers.value.filter(filterItem))

const enrichedFundraisers = computed(() =>
  conditionFiltered.value.map((f) => ({
    ...f,
    _campaignTitle: getCampaignPageTitle(f.campaignId)
  }))
)

const {
  query: searchQuery,
  results: displayedFundraisers,
  isSearching
} = useQuickFind(enrichedFundraisers, ['name', 'email', 'slug', '_campaignTitle'])

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Peer to Peer' },
  { label: 'Fundraiser Pages' }
]

const columnsWithActions = computed(() => [
  ...fundraiserColumns(getCampaignPageTitle),
  createViewActionColumn<CampaignFundraiser>((r) => `/admin/p2p/fundraisers/${r.id}`)
])

const EXPORT_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'template', header: 'Template' },
  { key: 'raised', header: 'Raised' },
  { key: 'goal', header: 'Goal' },
  { key: 'donations', header: 'Donations' },
  { key: 'created', header: 'Created' },
  { key: 'status', header: 'Status' }
]

function handleExport(format: 'csv' | 'xlsx') {
  const data = displayedFundraisers.value.map((f) => ({
    name: f.name,
    email: f.email,
    template: getParentName(f.parentCampaignId),
    raised: formatCurrency(f.raisedAmount, f.currency),
    goal: f.goal ? formatCurrency(f.goal, f.currency) : '',
    donations: f.donationCount,
    created: formatDate(f.createdAt),
    status: f.status
  }))
  exportData({ data, columns: EXPORT_COLUMNS, format, filename: 'fundraiser-pages' })
}
</script>

<template>
  <AdminListPage
    v-model:filter-values="filterValues"
    v-model:search-query="searchQuery"
    title="Fundraiser Pages"
    :breadcrumbs="breadcrumbs"
    :stats="stats"
    :columns="columnsWithActions"
    :data="displayedFundraisers"
    :filter-form="filterForm"
    :active-filter-count="activeFilterCount"
    filter-title="Fundraiser Filters"
    search-placeholder="Search by name, email, or campaign..."
    :is-searching="isSearching"
    :is-loading="false"
    :is-exporting="isExporting"
    row-base-path="/admin/p2p/fundraisers"
    @reset-filters="resetFilters()"
  >
    <template #export-menu>
      <DropdownMenuItem @click="handleExport('csv')">Export CSV</DropdownMenuItem>
      <DropdownMenuItem @click="handleExport('xlsx')">Export XLSX</DropdownMenuItem>
    </template>
  </AdminListPage>
</template>
