<script setup lang="ts">
import ShareContent from '~/features/campaigns/donor/components/ShareContent.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2 } from 'lucide-vue-next'

const { brandingStyle } = useBrandingCssVars()

// Load latest campaign for preview context (survives page refresh)
const { campaigns } = useCampaigns()
const latestCampaign = computed(
  () =>
    [...campaigns.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0]
)
</script>

<template>
  <Card :style="brandingStyle">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Share2 class="w-5 h-5" />
        Share Preview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ShareContent :campaign="latestCampaign" hide-copy-link />
    </CardContent>
  </Card>
</template>
