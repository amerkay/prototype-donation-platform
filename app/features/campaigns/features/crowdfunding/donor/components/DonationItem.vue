<script setup lang="ts">
import type { CampaignDonation } from '~/features/campaigns/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const props = defineProps<{
  donation: CampaignDonation
  campaignCurrency?: string
}>()

const { formatAmount, formatRelativeTime, getDonorInitials } = useCampaignFormatters()

const displayName = computed(() =>
  props.donation.isAnonymous ? 'Anonymous' : props.donation.donorName
)
</script>

<template>
  <div class="flex items-start gap-3 p-2 @3xl:p-3 rounded-lg hover:bg-muted/50 transition-colors">
    <Avatar class="w-8 h-8 @3xl:w-10 @3xl:h-10 shrink-0">
      <AvatarFallback class="text-xs @3xl:text-sm bg-primary/10 text-primary">
        {{ getDonorInitials(displayName) }}
      </AvatarFallback>
    </Avatar>
    <div class="flex-1 min-w-0">
      <div class="flex items-baseline justify-between gap-2">
        <span class="font-medium text-sm @3xl:text-base truncate">
          {{ displayName }}
        </span>
        <div class="text-right shrink-0">
          <span class="text-sm @3xl:text-base font-semibold text-primary">
            {{ formatAmount(donation.amount, donation.currency) }}
          </span>
          <div
            v-if="donation.matchedAmount && donation.matchedAmount > 0"
            class="text-xs text-green-600"
          >
            + {{ formatAmount(donation.matchedAmount, donation.currency) }} matched
          </div>
        </div>
      </div>
      <p
        v-if="donation.message"
        class="text-xs @3xl:text-sm text-muted-foreground line-clamp-2 mt-0.5"
      >
        "{{ donation.message }}"
      </p>
      <span class="text-xs @3xl:text-sm text-muted-foreground">
        {{ formatRelativeTime(donation.createdAt) }}
      </span>
    </div>
  </div>
</template>
