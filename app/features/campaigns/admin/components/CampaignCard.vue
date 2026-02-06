<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar, Heart, Users, TrendingUp, Target } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
  compact?: boolean
}>()

const { formatAmount, formatDate, getProgressPercentage } = useCampaignFormatters()
const { getCampaignById } = useCampaigns()

const progressPercentage = computed(() =>
  getProgressPercentage(
    props.campaign.stats.totalRaised,
    props.campaign.crowdfunding.goalAmount || 0
  )
)

const formattedDate = computed(() => formatDate(props.campaign.updatedAt))

const isP2P = computed(() => props.campaign.type === 'p2p')
const isFundraiser = computed(() => props.campaign.type === 'fundraiser')

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel(props.campaign))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(props.campaign.type))

const parentTemplate = computed(() => {
  if (!isFundraiser.value || !props.campaign.parentCampaignId) return null
  return getCampaignById(props.campaign.parentCampaignId)
})

const activeFundraisersCount = computed(
  () => props.campaign.fundraisers.filter((f) => f.status === 'active').length
)
</script>

<template>
  <Card
    :class="cn('transition-all hover:shadow-md h-full overflow-hidden pt-0', compact ? '' : '')"
  >
    <!-- Cover Photo -->
    <div class="relative aspect-3/1 bg-muted overflow-hidden">
      <img
        v-if="campaign.crowdfunding.coverPhoto"
        :src="campaign.crowdfunding.coverPhoto"
        :alt="campaign.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
      >
        <Heart class="w-8 h-8 text-primary/40" />
      </div>
    </div>

    <CardHeader>
      <div class="min-w-0">
        <CardTitle class="text-lg truncate">{{ campaign.name }}</CardTitle>
        <CardDescription v-if="parentTemplate && !compact" class="text-xs mt-1">
          Parent Template: {{ parentTemplate.name }}
        </CardDescription>
        <div class="flex items-center gap-1.5 mt-2">
          <Badge :variant="typeBadgeVariant" class="text-xs">
            {{ campaignTypeLabel }}
          </Badge>
          <Badge
            variant="outline"
            :data-campaign-status="campaign.status"
            class="border-(--cs-border) text-(--cs-text)"
          >
            <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
            {{ campaign.status }}
          </Badge>
        </div>
        <CardDescription v-if="!compact" class="flex items-center gap-2 mt-2">
          <Calendar class="w-3 h-3" />
          <span class="text-xs">Updated {{ formattedDate }}</span>
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- P2P Template: Total raised only (no goal - each fundraiser has own goal) -->
      <div v-if="isP2P" class="space-y-2">
        <div class="flex items-baseline justify-between text-sm">
          <span class="text-muted-foreground text-xs">Total Raised</span>
          <span class="font-semibold">{{
            formatAmount(campaign.stats.totalRaised, campaign.stats.currency, 0)
          }}</span>
        </div>
      </div>

      <!-- Standard Campaign: Progress bar with goal -->
      <div v-else-if="campaign.crowdfunding.goalAmount" class="space-y-2">
        <div class="flex items-baseline justify-between text-sm">
          <span class="font-semibold">{{
            formatAmount(campaign.stats.totalRaised, campaign.stats.currency, 0)
          }}</span>
          <span class="text-muted-foreground text-xs">
            of {{ formatAmount(campaign.crowdfunding.goalAmount, campaign.stats.currency, 0) }}
          </span>
        </div>
        <Progress :model-value="progressPercentage" class="h-2" />
        <p v-if="!compact" class="text-xs text-muted-foreground">
          {{ Math.round(progressPercentage) }}% funded
        </p>
      </div>

      <!-- Stats Grid -->
      <div v-if="!compact" class="flex justify-between pt-2">
        <div v-if="isP2P" class="flex items-center gap-2 text-sm">
          <Users class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ activeFundraisersCount }}</p>
            <p class="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <Users class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ campaign.stats.totalDonors }}</p>
            <p class="text-xs text-muted-foreground">Donors</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <TrendingUp class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ campaign.stats.totalDonations }}</p>
            <p class="text-xs text-muted-foreground">Donations</p>
          </div>
        </div>
      </div>

      <!-- Days Remaining Badge -->
      <div
        v-if="campaign.stats.daysRemaining && !compact"
        class="flex items-center gap-2 pt-2 border-t"
      >
        <Target class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">
          {{ campaign.stats.daysRemaining }} days remaining
        </span>
      </div>

      <!-- Actions -->
      <div v-if="!compact" class="pt-2">
        <slot name="actions">
          <Button variant="default" size="sm" class="w-full"> Edit Campaign </Button>
        </slot>
      </div>
    </CardContent>
  </Card>
</template>
