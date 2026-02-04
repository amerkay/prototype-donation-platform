<script setup lang="ts">
import CrowdfundingPage from '~/features/campaigns/donor/components/CrowdfundingPage.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'

definePageMeta({
  layout: 'donor'
})

const { getCampaignById } = useCampaigns()
const campaign = computed(() => getCampaignById('adopt-orangutan'))
</script>

<template>
  <div class="py-6 px-4 flex justify-center">
    <div class="w-full max-w-5xl">
      <CrowdfundingPage v-if="campaign" :campaign="campaign" />
    </div>
  </div>
</template>
