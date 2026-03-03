<script setup lang="ts">
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import CampaignProgress from '~/features/campaigns/features/crowdfunding/donor/components/CampaignProgress.vue'
import DataTable from '~/features/_shared/components/DataTable.vue'
import { fundraiserDonationColumns } from '~/features/donor-portal/columns/fundraiserDonationColumns'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import StatsCard from '@/components/StatsCard.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import {
  ICON_EXTERNAL_LINK,
  ICON_DONATION,
  ICON_CAMPAIGN,
  ICON_EDIT,
  ICON_RECEIPT,
  ICON_DONORS
} from '~/lib/icons'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { getCampaignById, campaigns } = useCampaigns()
const charityStore = useCharitySettingsStore()

// Use getCampaignById for auto-merge with parent (inherits matchedGiving, form, etc.)
const fundraiser = computed(() => getCampaignById(route.params.id as string))

// Check fundraiser metadata status from parent
const fundraiserMeta = computed(() => {
  if (!fundraiser.value) return undefined
  const parent = campaigns.value.find((c) => c.id === fundraiser.value!.parentCampaignId)
  return parent?.fundraisers.find((f) => f.campaignId === fundraiser.value!.id)
})

const isTerminal = computed(() => {
  const s = fundraiserMeta.value?.status ?? fundraiser.value?.status
  return s === 'completed' || s === 'ended'
})

const breadcrumbItems = computed(() => {
  if (!fundraiser.value) {
    return [
      { label: 'Dashboard', href: '/portal' },
      { label: 'My Fundraisers', href: '/portal/fundraisers' },
      { label: 'Not Found' }
    ]
  }
  return [
    { label: 'Dashboard', href: '/portal' },
    { label: 'My Fundraisers', href: '/portal/fundraisers' },
    { label: fundraiser.value.name }
  ]
})
</script>

<template>
  <div>
    <BreadcrumbBar :items="breadcrumbItems" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <!-- Not found / Removed -->
      <Empty v-if="!fundraiser">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ICON_CAMPAIGN />
          </EmptyMedia>
          <EmptyTitle>Can't find this fundraiser</EmptyTitle>
          <EmptyDescription> It may have been removed or the link is incorrect. </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink to="/portal/fundraisers">
            <Button variant="outline">Back to Fundraisers</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1.5">
            <div>
              <h1 class="inline text-2xl font-semibold tracking-tight">
                {{ fundraiser.name }}
              </h1>
              <StatusBadge
                :status="fundraiser.status"
                class="inline-block ml-3 align-text-bottom"
              />
            </div>
            <p class="text-sm text-muted-foreground">
              {{ fundraiser.crowdfunding.shortDescription }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 sm:shrink-0">
            <NuxtLink v-if="!isTerminal" :to="`/portal/fundraisers/${fundraiser.id}/edit`">
              <Button variant="default" size="sm" as="span">
                <ICON_EDIT class="w-3.5 h-3.5 mr-1" />
                Edit Campaign
              </Button>
            </NuxtLink>
            <NuxtLink :to="`/${charityStore.slug}/${fundraiser.id}`">
              <Button variant="outline" size="sm" as="span">
                <ICON_EXTERNAL_LINK class="w-3.5 h-3.5 mr-1" />
                View Page
              </Button>
            </NuxtLink>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid gap-6 grid-cols-2 sm:grid-cols-4 my-2">
          <!-- Progress (with matched giving from parent if applicable) -->
          <Card v-if="fundraiser.crowdfunding.goalAmount" class="col-span-2">
            <CardContent>
              <CampaignProgress
                :stats="fundraiser.stats"
                :goal-amount="fundraiser.crowdfunding.goalAmount"
                :end-date="fundraiser.crowdfunding.endDate"
                :matched-giving="fundraiser.matchedGiving"
                hide-footer
              />
            </CardContent>
          </Card>
          <StatsCard
            :icon="ICON_DONATION"
            label="Donations"
            :value="fundraiser.stats.totalDonations"
          />
          <StatsCard :icon="ICON_DONORS" label="Donors" :value="fundraiser.stats.totalDonors" />
        </div>

        <!-- Donations table -->
        <Card class="overflow-hidden">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <ICON_RECEIPT class="h-4 w-4" />
              Donations Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              :columns="fundraiserDonationColumns"
              :data="fundraiser.recentDonations"
              :page-size="10"
            />
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>
