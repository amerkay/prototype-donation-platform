<script setup lang="ts">
import type { CampaignDonation } from '~/features/campaigns/shared/types'
import DonationsList from './DonationsList.vue'
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ICON_DONATION } from '~/lib/icons'

defineProps<{
  donations: CampaignDonation[]
  totalCount: number
  defaultView?: 'recent' | 'top'
  campaignCurrency?: string
  /** Use smaller vertical padding on the empty state (mobile contexts) */
  compact?: boolean
}>()
</script>

<template>
  <DonationsList
    v-if="totalCount > 0"
    :donations="donations"
    :total-count="totalCount"
    :default-view="defaultView"
    :campaign-currency="campaignCurrency"
  />
  <Empty v-else :class="compact ? 'border py-6 gap-3' : 'border py-8 gap-3'">
    <EmptyMedia>
      <ICON_DONATION class="w-8 h-8 text-muted-foreground/40" />
    </EmptyMedia>
    <EmptyHeader class="gap-1">
      <EmptyTitle class="text-sm">No donations yet</EmptyTitle>
      <EmptyDescription>Be the first to donate!</EmptyDescription>
    </EmptyHeader>
  </Empty>
</template>
