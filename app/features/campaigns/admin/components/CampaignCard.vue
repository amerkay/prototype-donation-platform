<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import AdminEntityCard from '~/features/_admin/components/AdminEntityCard.vue'
import AdminEntityCardPlaceholder from '~/features/_admin/components/AdminEntityCardPlaceholder.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Heart, Users, TrendingUp, Target, Pencil } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
  compact?: boolean
  /** Override the default admin edit URL for all card links */
  href?: string
}>()

defineEmits<{
  delete: []
}>()

const { formatAmount, getProgressPercentage, formatTimeRemaining } = useCampaignFormatters()
const { getCampaignById, getDeleteProtection } = useCampaigns()

const deleteProtection = computed(() => getDeleteProtection(props.campaign.id))

const progressPercentage = computed(() =>
  getProgressPercentage(
    props.campaign.stats.totalRaised,
    props.campaign.crowdfunding.goalAmount || 0
  )
)

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

const editUrl = computed(() => props.href ?? `/admin/campaigns/${props.campaign.id}`)
</script>

<template>
  <AdminEntityCard
    :title="campaign.name"
    :href="editUrl"
    :updated-at="campaign.updatedAt"
    :description="
      !compact && parentTemplate ? `Parent Template: ${parentTemplate.name}` : undefined
    "
  >
    <template #image>
      <img
        v-if="campaign.crowdfunding.coverPhoto"
        :src="campaign.crowdfunding.coverPhoto"
        :alt="campaign.name"
        class="w-full h-full object-cover"
      />
      <AdminEntityCardPlaceholder v-else :icon="Heart" />
    </template>

    <template #badges>
      <Badge :variant="typeBadgeVariant" class="text-xs">
        {{ campaignTypeLabel }}
      </Badge>
      <StatusBadge :status="campaign.status" />
    </template>

    <template v-if="!compact" #stats>
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
        <p class="text-xs text-muted-foreground">{{ Math.round(progressPercentage) }}% funded</p>
      </div>

      <!-- Stats Grid -->
      <div class="flex justify-between pt-2">
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

      <!-- Time Remaining Badge -->
      <div
        v-if="formatTimeRemaining(campaign.crowdfunding.endDate)"
        class="flex items-center gap-2 pt-2 border-t"
      >
        <Target class="w-4 h-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground">
          {{ formatTimeRemaining(campaign.crowdfunding.endDate) }} remaining
        </span>
      </div>
    </template>

    <template v-if="!compact" #actions>
      <slot name="actions">
        <div class="flex gap-2">
          <Button variant="default" size="sm" class="flex-1" as-child>
            <NuxtLink :to="editUrl">
              <Pencil class="w-3.5 h-3.5 mr-1.5" />
              Edit
            </NuxtLink>
          </Button>
          <AdminDeleteButton
            :entity-name="campaign.name"
            entity-type="Campaign"
            :disabled="!deleteProtection.canDelete"
            :disabled-reason="deleteProtection.reason"
            @deleted="$emit('delete')"
          />
        </div>
      </slot>
    </template>
  </AdminEntityCard>
</template>
