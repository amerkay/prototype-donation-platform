<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import SocialShareButtons from '~/features/campaigns/donor/components/SocialShareButtons.vue'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { formatCurrency } from '~/lib/formatCurrency'

const campaignStore = useCampaignConfigStore()
const donationStore = useDonationFormStore()

const campaignSlug = computed(() => campaignStore.id)
const { campaignUrl, copy, copied } = useCampaignShare(campaignSlug)

const shareDescription = computed(() => {
  const amount = formatCurrency(
    donationStore.totalDonationAmount,
    donationStore.selectedCurrency,
    0
  )
  const name = campaignStore.name || 'this campaign'
  return `I just donated ${amount} to ${name}! Join me in making a difference.`
})

const handleShare = (platform: string) => {
  if (platform === 'copyLink') {
    copy(campaignUrl.value)
  }
}
</script>

<template>
  <Card>
    <CardContent class="space-y-3">
      <div class="flex items-center gap-2">
        <Icon name="lucide:share-2" class="h-5 w-5 text-primary" />
        <h3 class="font-semibold">Spread the word</h3>
      </div>
      <p class="text-sm text-muted-foreground">
        {{ shareDescription }}
      </p>
      <div class="flex flex-wrap gap-2">
        <SocialShareButtons
          :settings="campaignStore.socialSharing"
          :campaign-url="campaignUrl"
          :campaign-title="campaignStore.name || 'Donation Campaign'"
          :short-description="shareDescription"
          size="sm"
          variant="outline"
          @share="handleShare"
        />
      </div>
      <p v-if="copied" class="text-xs text-green-600">Link copied to clipboard!</p>
    </CardContent>
  </Card>
</template>
