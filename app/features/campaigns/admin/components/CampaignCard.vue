<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant,
  getCampaignEditPath
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { getActivePeriod } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import AdminEntityCard from '~/features/_admin/components/AdminEntityCard.vue'
import AdminEntityCardPlaceholder from '~/features/_admin/components/AdminEntityCardPlaceholder.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import CampaignProgress from '~/features/campaigns/features/crowdfunding/donor/components/CampaignProgress.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ICON_TIME_REMAINING,
  ICON_DONATION,
  ICON_DONORS,
  ICON_TRENDING,
  ICON_EDIT
} from '~/lib/icons'

const props = defineProps<{
  campaign: Campaign
  compact?: boolean
  /** Override the default admin edit URL for all card links */
  href?: string
}>()

defineEmits<{
  delete: []
}>()

const { formatAmount, formatTimeRemaining } = useCampaignFormatters()
const { getCampaignById, getDeleteProtection } = useCampaigns()

const deleteProtection = computed(() => getDeleteProtection(props.campaign.id))

const isP2P = computed(() => props.campaign.type === 'p2p')
const isFundraiser = computed(() => props.campaign.type === 'p2p-fundraiser')

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel(props.campaign))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(props.campaign.type))

const parentTemplate = computed(() => {
  if (!isFundraiser.value || !props.campaign.parentCampaignId) return null
  return getCampaignById(props.campaign.parentCampaignId)
})

const hasActivePeriod = computed(
  () => getActivePeriod(props.campaign.matchedGiving?.periods ?? []) != null
)

const activeFundraisersCount = computed(
  () => props.campaign.fundraisers.filter((f) => f.status === 'active').length
)

const editUrl = computed(
  () => props.href ?? getCampaignEditPath(props.campaign.type, props.campaign.id)
)
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
      <AdminEntityCardPlaceholder v-else :icon="ICON_DONATION" />
    </template>

    <template #badges>
      <Badge :variant="typeBadgeVariant" class="text-xs">
        {{ campaignTypeLabel }}
      </Badge>
      <StatusBadge :status="campaign.status" />
      <Badge
        v-if="campaign.matchedGiving?.periods?.length"
        :variant="hasActivePeriod ? 'secondary' : 'outline'"
        class="text-xs"
      >
        Matched
      </Badge>
      <Badge v-if="campaign.isArchived" variant="secondary" class="text-xs"> Archived </Badge>
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

      <!-- Standard/Event Campaign: Progress with matched giving support -->
      <CampaignProgress
        v-else-if="campaign.crowdfunding.goalAmount"
        :stats="campaign.stats"
        :goal-amount="campaign.crowdfunding.goalAmount"
        :end-date="campaign.crowdfunding.endDate"
        :matched-giving="campaign.matchedGiving"
        :campaign-status="campaign.status"
        hide-footer
      />

      <!-- Stats Grid -->
      <div class="flex justify-between pt-2">
        <div v-if="isP2P" class="flex items-center gap-2 text-sm">
          <ICON_DONORS class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ activeFundraisersCount }}</p>
            <p class="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <ICON_DONORS class="w-4 h-4 text-muted-foreground" />
          <div>
            <p class="font-medium">{{ campaign.stats.totalDonors }}</p>
            <p class="text-xs text-muted-foreground">Donors</p>
          </div>
        </div>
        <div class="flex items-center gap-2 text-sm">
          <ICON_TRENDING class="w-4 h-4 text-muted-foreground" />
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
        <ICON_TIME_REMAINING class="w-4 h-4 text-muted-foreground" />
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
              <ICON_EDIT class="w-3.5 h-3.5 mr-1.5" />
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
