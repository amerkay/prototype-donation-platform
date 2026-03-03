<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import CampaignCard from '~/features/campaigns/admin/components/CampaignCard.vue'
import BreadcrumbBar from '~/features/_shared/components/BreadcrumbBar.vue'
import StatusBadge from '~/components/StatusBadge.vue'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { ICON_FORWARD, ICON_CAMPAIGN, ICON_EDIT } from '~/lib/icons'
import type { Campaign } from '~/features/campaigns/shared/types'

definePageMeta({
  layout: 'portal'
})

const { currentUserFundraisers } = useDonorPortal()
const { campaigns, getCampaignById } = useCampaigns()
const charityStore = useCharitySettingsStore()

/** Get the fundraiser metadata status from the parent P2P template */
function getFundraiserMetaStatus(fundraiserCampaign: Campaign) {
  const parent = campaigns.value.find((c) => c.id === fundraiserCampaign.parentCampaignId)
  if (!parent) return undefined
  return parent.fundraisers.find((f) => f.campaignId === fundraiserCampaign.id)?.status
}

// Use getCampaignById to auto-merge parent fields (matchedGiving, form, etc.)
const visibleFundraisers = computed(() =>
  currentUserFundraisers.value
    .map((f) => getCampaignById(f.id))
    .filter((f): f is Campaign => f != null)
)

/** Whether a fundraiser is in a terminal state (completed or ended) */
function isTerminal(f: Campaign) {
  const meta = getFundraiserMetaStatus(f)
  return (
    meta === 'completed' || meta === 'ended' || f.status === 'completed' || f.status === 'ended'
  )
}
</script>

<template>
  <div>
    <BreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'My Fundraisers' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">My Fundraisers</h1>
        <p class="text-sm text-muted-foreground">Campaigns you've started and how they're doing.</p>
      </div>

      <Empty v-if="visibleFundraisers.length === 0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ICON_CAMPAIGN />
          </EmptyMedia>
          <EmptyTitle>No fundraisers yet</EmptyTitle>
          <EmptyDescription>
            When you create a fundraising page, it'll appear here so you can track donations and
            share it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink :to="`/${charityStore.slug}/p2p-templates`">
            <Button>Browse P2P Templates</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CampaignCard
          v-for="f in visibleFundraisers"
          :key="f.id"
          :campaign="f"
          :href="`/portal/fundraisers/${f.id}`"
        >
          <template #actions>
            <div class="flex gap-2">
              <NuxtLink
                v-if="!isTerminal(f)"
                :to="`/portal/fundraisers/${f.id}/edit`"
                class="flex-1"
              >
                <Button variant="default" size="sm" class="w-full" as="span">
                  <ICON_EDIT class="w-3.5 h-3.5 mr-1" />
                  Edit Campaign
                </Button>
              </NuxtLink>
              <StatusBadge
                v-else
                :status="getFundraiserMetaStatus(f) ?? f.status"
                class="self-center"
              />
              <NuxtLink :to="`/portal/fundraisers/${f.id}`">
                <Button variant="outline" size="sm" as="span">
                  Donations <ICON_FORWARD class="w-3.5 h-3.5 ml-1" />
                </Button>
              </NuxtLink>
            </div>
          </template>
        </CampaignCard>
      </div>
    </div>
  </div>
</template>
