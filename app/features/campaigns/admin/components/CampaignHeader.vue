<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import InlineEditableText from '~/features/_admin/components/InlineEditableText.vue'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getStatusColor } from '~/lib/statusColors'
import { cn } from '@/lib/utils'
import CampaignDeleteButton from './CampaignDeleteButton.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const store = useCampaignConfigStore()
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
const statusColor = computed(() => getStatusColor(store.status))

const campaignTypeLabel = computed(() => getCampaignTypeShortLabel({ type: store.type }))
const typeBadgeVariant = computed(() => getCampaignTypeBadgeVariant(store.type))

// P2P templates show total raised only (no progress bar, as each fundraiser has own goal)
const showProgress = computed(() => !store.isP2P && store.crowdfunding?.goalAmount)

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' }
]

function handleStatusChange(value: string | number | bigint | Record<string, unknown> | null) {
  if (typeof value === 'string') {
    emit('update:status', value as CampaignStatus)
  }
}
</script>

<template>
  <div v-if="store.stats" class="bg-muted/30 rounded-xl border px-4 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <!-- Left: Campaign name, type and status -->
      <div class="flex w-full items-center gap-x-3 gap-y-1.5 min-w-0 flex-wrap sm:w-auto">
        <div class="flex basis-full min-w-0 items-center gap-2 sm:basis-auto">
          <InlineEditableText
            :model-value="store.name"
            display-class="text-lg font-bold"
            class="min-w-0"
            @update:model-value="emit('update:name', $event)"
          />
          <div class="ml-auto shrink-0 sm:hidden">
            <CampaignDeleteButton @deleted="emit('deleted')" />
          </div>
        </div>
        <Badge
          :variant="typeBadgeVariant"
          class="h-6 shrink-0 px-2 py-0 inline-flex items-center text-xs"
        >
          {{ campaignTypeLabel }}
        </Badge>

        <!-- Status dropdown (all campaign types) -->
        <Select :model-value="store.status" @update:model-value="handleStatusChange">
          <SelectTrigger
            :class="
              cn(
                'data-[size=default]:h-6 w-auto gap-1 rounded-full px-2 py-0 text-xs font-medium shadow-none',
                statusColor.border,
                statusColor.text
              )
            "
          >
            <span :class="cn('size-1.5 shrink-0 rounded-full', statusColor.dot)" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <template v-for="opt in STATUS_OPTIONS" :key="opt.value">
              <!-- Draft disabled when campaign has donations -->
              <Tooltip v-if="opt.value === 'draft' && hasDonations" :delay-duration="100">
                <TooltipTrigger as-child>
                  <div>
                    <SelectItem :value="opt.value" disabled class="text-xs">
                      <span class="flex items-center gap-2">
                        <span
                          :class="
                            cn('size-1.5 shrink-0 rounded-full', getStatusColor(opt.value).dot)
                          "
                        />
                        {{ opt.label }}
                        <span class="text-muted-foreground ml-auto text-[10px]">
                          Has donations
                        </span>
                      </span>
                    </SelectItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" class="text-xs">
                  Cannot revert to draft after receiving donations
                </TooltipContent>
              </Tooltip>
              <!-- Non-draft statuses disabled when form has errors -->
              <Tooltip
                v-else-if="opt.value !== 'draft' && !props.canActivate"
                :delay-duration="100"
              >
                <TooltipTrigger as-child>
                  <div>
                    <SelectItem :value="opt.value" disabled class="text-xs">
                      <span class="flex items-center gap-2">
                        <span
                          :class="
                            cn('size-1.5 shrink-0 rounded-full', getStatusColor(opt.value).dot)
                          "
                        />
                        {{ opt.label }}
                        <span class="text-destructive ml-auto text-[10px]">Fix errors</span>
                      </span>
                    </SelectItem>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" class="text-xs">
                  Requires valid settings and at least one form
                </TooltipContent>
              </Tooltip>
              <SelectItem v-else :value="opt.value" class="text-xs">
                <span class="flex items-center gap-2">
                  <span
                    :class="cn('size-1.5 shrink-0 rounded-full', getStatusColor(opt.value).dot)"
                  />
                  {{ opt.label }}
                </span>
              </SelectItem>
            </template>
          </SelectContent>
        </Select>
      </div>

      <!-- Center: Total raised only (for P2P templates) -->
      <div
        v-if="store.isP2P"
        class="flex h-6 items-center gap-3 px-3 bg-background rounded-full border sm:ml-auto"
      >
        <span class="text-xs text-muted-foreground whitespace-nowrap">Total Raised</span>
        <span class="text-sm font-medium whitespace-nowrap">
          {{ formatAmount(store.stats.totalRaised, store.stats.currency) }}
        </span>
      </div>

      <!-- Center: Progress chip (for standard campaigns and fundraisers with goals) -->
      <div
        v-else-if="showProgress"
        class="flex h-7 w-full items-center gap-3 px-3 bg-background rounded-full border sm:w-auto sm:ml-auto"
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

      <!-- Delete button (desktop only — mobile shows it next to the title) -->
      <div class="hidden shrink-0 sm:block">
        <CampaignDeleteButton @deleted="emit('deleted')" />
      </div>
    </div>
  </div>
</template>
