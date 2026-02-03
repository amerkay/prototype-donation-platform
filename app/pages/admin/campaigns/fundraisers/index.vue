<script setup lang="ts">
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import CampaignList from '~/features/campaigns/admin/components/CampaignList.vue'
import { useFeatureFlags } from '~/composables/useFeatureFlags'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'admin'
})

const { currentUserFundraisers } = useFeatureFlags()

const activeFundraisers = computed(() =>
  currentUserFundraisers.value.filter((c) => c.status === 'active')
)

const totalRaised = computed(() =>
  currentUserFundraisers.value.reduce((sum, c) => sum + c.stats.totalRaised, 0)
)

const totalDonations = computed(() =>
  currentUserFundraisers.value.reduce((sum, c) => sum + c.stats.totalDonations, 0)
)

const averageRaised = computed(() => {
  if (currentUserFundraisers.value.length === 0) return 0
  return totalRaised.value / currentUserFundraisers.value.length
})

const formattedTotalRaised = computed(() => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(totalRaised.value)
})

const formattedAverageRaised = computed(() => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(averageRaised.value)
})

const breadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'Campaigns', href: '/admin/campaigns/standard' },
  { label: 'My Fundraisers' }
]
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbs" />

    <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
      <!-- Header Stats -->
      <div class="mb-6 space-y-2">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold">My Fundraisers</h1>
        </div>
        <div class="flex gap-6 text-sm text-muted-foreground">
          <div>
            <span class="font-semibold text-foreground">{{ currentUserFundraisers.length }}</span>
            total
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ activeFundraisers.length }}</span>
            active
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ formattedTotalRaised }}</span> raised
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ totalDonations }}</span>
            donations
          </div>
          <div>
            <span class="font-semibold text-foreground">{{ formattedAverageRaised }}</span>
            average
          </div>
        </div>
      </div>

      <!-- Campaign List -->
      <CampaignList v-if="currentUserFundraisers.length > 0" :campaigns="currentUserFundraisers" />

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <p class="text-muted-foreground">No fundraisers yet</p>
        <p class="text-sm text-muted-foreground mt-1">
          Visit a P2P template campaign to create your first fundraiser
        </p>
        <NuxtLink to="/admin/campaigns/p2p" class="mt-4 inline-block">
          <Button>Browse P2P Templates</Button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
