<script setup lang="ts">
import type { CampaignDonation } from '~/features/campaigns/shared/types'
import DonationItem from './DonationItem.vue'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  donations: CampaignDonation[]
  totalCount: number
  defaultView?: 'recent' | 'top'
}>()

const currentView = ref<'recent' | 'top'>(props.defaultView || 'recent')

const sortedDonations = computed(() => {
  const donations = [...props.donations]

  if (currentView.value === 'top') {
    donations.sort((a, b) => b.amount - a.amount)
  } else {
    donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return donations
})
</script>

<template>
  <div class="space-y-3">
    <!-- Header with view toggle -->
    <div class="flex items-center justify-between ml-3">
      <h3
        class="font-semibold text-sm @3xl:text-base uppercase tracking-wide text-muted-foreground"
      >
        {{ currentView === 'recent' ? 'Recent' : 'Top' }} Donations
      </h3>
      <div class="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          class="h-7 @3xl:h-8 px-2 @3xl:px-3 text-xs @3xl:text-sm"
          :class="{ 'bg-muted': currentView === 'recent' }"
          @click="currentView = 'recent'"
        >
          Recent
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="h-7 @3xl:h-8 px-2 @3xl:px-3 text-xs @3xl:text-sm"
          :class="{ 'bg-muted': currentView === 'top' }"
          @click="currentView = 'top'"
        >
          Top
        </Button>
      </div>
    </div>

    <!-- Donations list -->
    <div class="space-y-2">
      <DonationItem v-for="donation in sortedDonations" :key="donation.id" :donation="donation" />
    </div>

    <!-- Total count -->
    <p class="text-xs @3xl:text-sm text-center text-muted-foreground pt-1">
      {{ totalCount }} total donations
    </p>
  </div>
</template>
