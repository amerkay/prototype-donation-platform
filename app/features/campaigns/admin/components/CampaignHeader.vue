<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import {
  CAMPAIGN_STATUS_OPTIONS,
  FUNDRAISER_STATUS_OPTIONS,
  type CampaignStatus
} from '~/features/campaigns/shared/types'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import EndFundraiserButton from '~/features/campaigns/features/p2p/admin/components/EndFundraiserButton.vue'
import CampaignProgress from '~/features/campaigns/features/crowdfunding/donor/components/CampaignProgress.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ICON_ARCHIVE, ICON_RESTORE } from '~/lib/icons'

const store = useCampaignConfigStore()
const { getDeleteProtection, getCampaignById } = useCampaigns()
const { formatAmount, formatTimeRemainingShort } = useCampaignFormatters()

const props = defineProps<{
  canActivate?: boolean
  /** Portal mode: hide admin-only controls (archive, delete), show stop action */
  portalMode?: boolean
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:status': [value: CampaignStatus]
  'update:archived': [value: boolean]
  deleted: []
}>()

const hasDonations = computed(() => (store.stats?.totalDonations ?? 0) > 0)
const deleteProtection = computed(() =>
  store.id ? getDeleteProtection(store.id) : { canDelete: false, reason: 'Campaign not found' }
)

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel({ type: store.type }))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(store.type))

const showProgress = computed(() => !store.isP2P && store.crowdfunding?.goalAmount)

const isFundraiser = computed(() => store.type === 'p2p-fundraiser')

/** Admin gets all statuses including terminal; portal gets only active */
const ALL_CAMPAIGN_STATUSES: { value: string; label: string }[] = [
  ...CAMPAIGN_STATUS_OPTIONS,
  { value: 'completed', label: 'Completed' },
  { value: 'ended', label: 'Ended' }
]

const ALL_FUNDRAISER_STATUSES: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'ended', label: 'Ended' }
]

/** P2P templates only have draft + active (no terminal states, no archive) */
const P2P_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' }
]

const activeStatusOptions = computed(() => {
  if (props.portalMode) {
    return isFundraiser.value ? FUNDRAISER_STATUS_OPTIONS : CAMPAIGN_STATUS_OPTIONS
  }
  if (store.isP2P) return P2P_STATUS_OPTIONS
  return isFundraiser.value ? ALL_FUNDRAISER_STATUSES : ALL_CAMPAIGN_STATUSES
})

// Parent gating: lock fundraiser when parent campaign is ended/completed
const parentCampaign = computed(() =>
  store.parentCampaignId ? getCampaignById(store.parentCampaignId) : undefined
)

const parentLocked = computed(() => {
  if (!parentCampaign.value) return false
  return parentCampaign.value.status === 'completed' || parentCampaign.value.status === 'ended'
})

const isTerminal = computed(() => store.status === 'completed' || store.status === 'ended')
const isDraft = computed(() => store.status === 'draft')

const canEnd = computed(
  () => props.portalMode && !isTerminal.value && !parentLocked.value && store.status === 'active'
)

const disabledOptions = computed(() => {
  const disabled: { value: string; reason: string }[] = []

  // Archived campaigns: must unarchive before changing status
  if (store.isArchived) {
    for (const opt of activeStatusOptions.value) {
      disabled.push({ value: opt.value, reason: 'Unarchive to change status' })
    }
    return disabled
  }

  // Parent campaign locked — disable all status changes
  if (parentLocked.value) {
    for (const opt of activeStatusOptions.value) {
      disabled.push({ value: opt.value, reason: 'Parent campaign has ended' })
    }
    return disabled
  }

  // Portal mode: terminal states lock the dropdown
  if (props.portalMode && isTerminal.value) {
    for (const opt of activeStatusOptions.value) {
      disabled.push({ value: opt.value, reason: 'This fundraiser has ended' })
    }
    return disabled
  }

  // Standard campaign rules
  if (hasDonations.value) {
    disabled.push({ value: 'draft', reason: 'Cannot revert to draft after receiving donations' })
  }
  if (!props.canActivate) {
    for (const opt of activeStatusOptions.value) {
      if (opt.value !== 'draft') {
        disabled.push({
          value: opt.value,
          reason: 'Requires valid settings and at least one form'
        })
      }
    }
  }
  return disabled
})
</script>

<template>
  <AdminResourceHeader v-if="store.stats">
    <template #left>
      <div class="flex basis-full min-w-0 items-center gap-2 sm:basis-auto">
        <InlineEditableText
          :model-value="store.name"
          display-class="text-lg font-bold"
          class="min-w-0"
          :max-length="75"
          @update:model-value="emit('update:name', $event)"
        />
        <div class="ml-auto shrink-0 sm:hidden flex items-center gap-2">
          <Button
            v-if="!portalMode && isDraft"
            size="sm"
            :disabled="!canActivate"
            :title="!canActivate ? 'Requires valid settings and at least one form' : undefined"
            @click="emit('update:status', 'active' as CampaignStatus)"
          >
            Publish
          </Button>
          <AdminDeleteButton
            v-if="!portalMode"
            :entity-name="store.name"
            entity-type="Campaign"
            :disabled="!deleteProtection.canDelete"
            :disabled-reason="deleteProtection.reason"
            @deleted="emit('deleted')"
          />
          <EndFundraiserButton
            v-if="canEnd"
            :name="store.name"
            @confirm="emit('update:status', 'ended' as CampaignStatus)"
          />
        </div>
      </div>
      <Badge
        :variant="typeBadgeVariant"
        class="h-6 shrink-0 px-2 py-0 inline-flex items-center text-xs gap-1"
      >
        {{ campaignTypeLabel }}
      </Badge>
      <Badge
        v-if="store.hasMatchedGiving && store.activePeriod"
        variant="secondary"
        class="h-6 shrink-0 px-2 py-0 inline-flex items-center text-xs gap-1"
      >
        {{ store.activePeriod.multiplier }}x Match
      </Badge>
      <AdminStatusSelect
        :model-value="store.status"
        :options="activeStatusOptions"
        :disabled-options="disabledOptions"
        @update:model-value="emit('update:status', $event as CampaignStatus)"
      />
      <!-- Archived badge (admin only) -->
      <Badge
        v-if="!portalMode && store.isArchived"
        variant="secondary"
        class="h-6 shrink-0 px-2 py-0 inline-flex items-center text-xs"
      >
        Archived
      </Badge>

      <!-- P2P templates: total raised -->
      <div
        v-if="store.isP2P"
        class="flex h-6 items-center gap-3 px-3 bg-background rounded-full border"
      >
        <span class="text-xs text-muted-foreground whitespace-nowrap">Total Raised</span>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised, store.stats.currency) }}
        </span>
      </div>

      <!-- Standard + matched campaigns: progress chip -->
      <div
        v-else-if="showProgress"
        class="flex h-7 items-center gap-3 px-3 bg-background rounded-full border"
      >
        <CampaignProgress
          :stats="store.stats"
          :goal-amount="store.crowdfunding?.goalAmount ?? 0"
          :end-date="store.crowdfunding?.endDate"
          :matched-giving="store.matchedGiving"
          compact
        >
          <span class="text-sm font-medium whitespace-nowrap">
            {{
              formatAmount(
                store.hasMatchedGiving ? store.matchedTotal : store.stats.totalRaised,
                store.stats.currency
              )
            }}
            <span class="text-muted-foreground font-normal">
              / {{ formatAmount(store.crowdfunding?.goalAmount ?? 0, store.stats.currency) }}
            </span>
          </span>
          <span
            v-if="formatTimeRemainingShort(store.crowdfunding?.endDate)"
            class="text-xs text-muted-foreground whitespace-nowrap"
          >
            {{ formatTimeRemainingShort(store.crowdfunding?.endDate) }} left
          </span>
        </CampaignProgress>
      </div>
    </template>

    <template #right>
      <!-- End Fundraiser (portal only, active) -->
      <EndFundraiserButton
        v-if="canEnd"
        :name="store.name"
        @confirm="emit('update:status', 'ended' as CampaignStatus)"
      />

      <!-- Archive / Unarchive button (admin only, terminal states only) -->
      <Button
        v-if="!portalMode && !store.isP2P && (isTerminal || store.isArchived)"
        variant="ghost"
        size="icon"
        class="h-8 w-8"
        :title="store.isArchived ? 'Unarchive' : 'Archive'"
        @click="emit('update:archived', !store.isArchived)"
      >
        <ICON_RESTORE v-if="store.isArchived" class="h-4 w-4" />
        <ICON_ARCHIVE v-else class="h-4 w-4" />
      </Button>
      <Button
        v-if="!portalMode && isDraft"
        size="sm"
        :disabled="!canActivate"
        :title="!canActivate ? 'Requires valid settings and at least one form' : undefined"
        @click="emit('update:status', 'active' as CampaignStatus)"
      >
        Publish
      </Button>
      <AdminDeleteButton
        v-if="!portalMode"
        :entity-name="store.name"
        entity-type="Campaign"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>
</template>
