<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { Button } from '@/components/ui/button'
import { ICON_DONATION, ICON_FORWARD } from '~/lib/icons'

defineProps<{
  campaign: Campaign
  href: string
}>()
</script>

<template>
  <NuxtLink
    :to="href"
    class="group block rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
  >
    <!-- Cover image -->
    <div class="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
      <img
        v-if="campaign.crowdfunding.coverPhoto"
        :src="campaign.crowdfunding.coverPhoto"
        :alt="campaign.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <ICON_DONATION v-else class="w-10 h-10 text-muted-foreground/40" />
    </div>

    <!-- Body -->
    <div class="p-5 space-y-4">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold leading-snug">{{ campaign.name }}</h2>
        <p
          v-if="campaign.crowdfunding.shortDescription"
          class="text-sm text-muted-foreground line-clamp-2"
        >
          {{ campaign.crowdfunding.shortDescription }}
        </p>
      </div>

      <Button class="w-full pointer-events-none" tabindex="-1">
        Start Fundraising
        <ICON_FORWARD class="w-4 h-4 ml-1" />
      </Button>
    </div>
  </NuxtLink>
</template>
