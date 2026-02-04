<script setup lang="ts">
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { AlertCircle } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'donor'
})

const route = useRoute()
const campaignId = computed(() => route.params.id as string)

const { getCampaignById } = useCampaigns()
const campaign = computed(() => getCampaignById(campaignId.value))
</script>

<template>
  <div class="py-6 px-4 flex justify-center">
    <div class="w-full max-w-5xl">
      <CrowdfundingPage v-if="campaign" :campaign="campaign" />

      <div v-else class="max-w-md mx-auto">
        <Card>
          <CardContent class="py-10 text-center space-y-4">
            <AlertCircle class="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 class="text-lg font-semibold">Campaign Not Found</h2>
            <p class="text-sm text-muted-foreground">
              This campaign doesn't exist or is no longer available.
            </p>
            <NuxtLink to="/">
              <Button>Back to Explore</Button>
            </NuxtLink>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
