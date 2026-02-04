<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { getPresetById } from '~/features/campaigns/admin/templates'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Heart } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
}>()

defineEmits<{
  select: [campaignId: string]
}>()

const presetIcon = computed(() => {
  if (!props.campaign.p2pPreset) return Heart
  return getPresetById(props.campaign.p2pPreset)?.metadata.icon ?? Heart
})
</script>

<template>
  <Card class="group hover:border-primary/40 transition-colors h-full flex flex-col">
    <CardHeader class="space-y-3 flex-1">
      <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <component :is="presetIcon" class="w-6 h-6 text-primary" />
      </div>
      <div class="space-y-1">
        <CardTitle class="text-lg">{{ campaign.name }}</CardTitle>
        <CardDescription class="text-sm leading-relaxed">
          {{ campaign.crowdfunding.shortDescription }}
        </CardDescription>
      </div>
    </CardHeader>
    <CardContent class="pt-0">
      <Button class="w-full" @click="$emit('select', campaign.id)">
        Start Fundraising
        <ArrowRight class="w-4 h-4 ml-1" />
      </Button>
    </CardContent>
  </Card>
</template>
