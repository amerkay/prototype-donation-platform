<script setup lang="ts">
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import CampaignCard from '~/features/campaigns/admin/components/CampaignCard.vue'
import { Button } from '@/components/ui/button'
import { ArrowRight, Users } from 'lucide-vue-next'

definePageMeta({
  layout: 'donor'
})

const { campaigns } = useCampaigns()
const route = useRoute()
const router = useRouter()

const p2pCampaigns = computed(() =>
  campaigns.value.filter((c) => c.type === 'p2p' && c.status === 'active')
)

const handleSelect = (campaignId: string) => {
  router.push(`/${route.params.org_slug}/p2p-onboard/${campaignId}`)
}
</script>

<template>
  <div class="py-8 px-4">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Hero -->
      <div class="text-center space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Users class="w-7 h-7 text-primary" />
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
          Start Your Own Fundraiser for BOSF
        </h1>
        <p class="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Choose a template to create your personal fundraising page. Rally your friends and family
          to support orangutan conservation.
        </p>
      </div>

      <!-- Template Grid -->
      <div class="grid gap-6 sm:grid-cols-2">
        <CampaignCard v-for="campaign in p2pCampaigns" :key="campaign.id" :campaign="campaign">
          <template #actions>
            <Button class="w-full" @click="handleSelect(campaign.id)">
              Start Fundraising
              <ArrowRight class="w-4 h-4 ml-1" />
            </Button>
          </template>
        </CampaignCard>
      </div>
    </div>
  </div>
</template>
