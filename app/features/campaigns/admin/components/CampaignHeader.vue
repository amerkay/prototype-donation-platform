<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import AdminResourceHeader from '~/features/_admin/components/AdminResourceHeader.vue'
import AdminStatusSelect from '~/features/_admin/components/AdminStatusSelect.vue'
import AdminDeleteButton from '~/features/_admin/components/AdminDeleteButton.vue'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const store = useCampaignConfigStore()
const { getDeleteProtection } = useCampaigns()
const { formatAmount, formatTimeRemainingShort } = useCampaignFormatters()

const props = defineProps<{
  canActivate?: boolean
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:status': [value: CampaignStatus]
  deleted: []
}>()

const hasDonations = computed(() => (store.stats?.totalDonations ?? 0) > 0)
const deleteProtection = computed(() =>
  store.id ? getDeleteProtection(store.id) : { canDelete: false, reason: 'Campaign not found' }
)

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel({ type: store.type }))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(store.type))

const showProgress = computed(() => !store.isP2P && store.crowdfunding?.goalAmount)

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
]

const disabledOptions = computed(() => {
  const disabled: { value: string; reason: string }[] = []
  if (hasDonations.value) {
    disabled.push({ value: 'draft', reason: 'Cannot revert to draft after receiving donations' })
  }
  if (!props.canActivate) {
    for (const opt of STATUS_OPTIONS) {
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
        <div class="ml-auto shrink-0 sm:hidden">
          <AdminDeleteButton
            :entity-name="store.name"
            entity-type="Campaign"
            :disabled="!deleteProtection.canDelete"
            :disabled-reason="deleteProtection.reason"
            @deleted="emit('deleted')"
          />
        </div>
      </div>
      <Badge
        :variant="typeBadgeVariant"
        class="h-6 shrink-0 px-2 py-0 inline-flex items-center text-xs"
      >
        {{ campaignTypeLabel }}
      </Badge>
      <AdminStatusSelect
        :model-value="store.status"
        :options="STATUS_OPTIONS"
        :disabled-options="disabledOptions"
        @update:model-value="emit('update:status', $event as CampaignStatus)"
      />
    </template>

    <template #center>
      <!-- P2P templates: total raised only -->
      <div
        v-if="store.isP2P"
        class="flex h-6 items-center gap-3 px-3 bg-background rounded-full border"
      >
        <span class="text-xs text-muted-foreground whitespace-nowrap">Total Raised</span>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised, store.stats.currency) }}
        </span>
      </div>

      <!-- Standard campaigns: progress chip -->
      <div
        v-else-if="showProgress"
        class="flex h-7 w-full items-center gap-3 px-3 bg-background rounded-full border sm:w-auto"
      >
        <div class="w-24">
          <Progress :model-value="store.progressPercentage" class="h-2" />
        </div>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised, store.stats.currency) }}
          <span class="text-muted-foreground font-normal">
            / {{ formatAmount(store.crowdfunding?.goalAmount ?? 0) }}
          </span>
        </span>
        <span
          v-if="formatTimeRemainingShort(store.crowdfunding?.endDate)"
          class="text-xs text-muted-foreground whitespace-nowrap"
        >
          {{ formatTimeRemainingShort(store.crowdfunding?.endDate) }} left
        </span>
      </div>
    </template>

    <template #right>
      <AdminDeleteButton
        :entity-name="store.name"
        entity-type="Campaign"
        :disabled="!deleteProtection.canDelete"
        :disabled-reason="deleteProtection.reason"
        @deleted="emit('deleted')"
      />
    </template>
  </AdminResourceHeader>
</template>
