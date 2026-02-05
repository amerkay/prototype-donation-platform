<script setup lang="ts">
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import P2POnboardingWizard from '~/features/campaigns/donor/components/P2POnboardingWizard.vue'
import { AlertCircle } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

definePageMeta({
  layout: 'donor'
})

const route = useRoute()
const campaignId = computed(() => route.params.campaignId as string)

const { getCampaignById } = useCampaigns()
const campaign = computed(() => {
  const c = getCampaignById(campaignId.value)
  return c?.type === 'p2p' ? c : undefined
})
</script>

<template>
  <div class="py-8 px-4">
    <!-- Valid P2P campaign -->
    <P2POnboardingWizard v-if="campaign" :campaign="campaign" />

    <!-- Invalid campaign fallback -->
    <div v-else class="max-w-md mx-auto">
      <Card>
        <CardContent class="py-10 text-center space-y-4">
          <AlertCircle class="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 class="text-lg font-semibold">Template Not Found</h2>
          <p class="text-sm text-muted-foreground">
            This fundraiser template doesn't exist or is no longer available.
          </p>
          <NuxtLink :to="`/${route.params.org_slug}/p2p-templates`">
            <Button>Browse Templates</Button>
          </NuxtLink>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
