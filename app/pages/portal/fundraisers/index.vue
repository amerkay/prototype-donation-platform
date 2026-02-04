<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import CampaignCard from '~/features/campaigns/admin/components/CampaignCard.vue'
import { Button } from '@/components/ui/button'
import { ArrowRight, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const { currentUserFundraisers } = useDonorPortal()
</script>

<template>
  <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
    <div class="py-4 space-y-1">
      <h1 class="text-xl font-semibold tracking-tight">My Fundraisers</h1>
      <p class="text-sm text-muted-foreground">
        Your peer-to-peer fundraising campaigns and their donations.
      </p>
    </div>

    <div v-if="currentUserFundraisers.length === 0" class="text-center py-12">
      <p class="text-muted-foreground">No fundraisers yet.</p>
      <p class="text-sm text-muted-foreground mt-1">
        Visit P2P templates to create your first fundraiser.
      </p>
      <NuxtLink to="/donor/p2p-templates" class="mt-4 inline-block">
        <Button>Browse P2P Templates</Button>
      </NuxtLink>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <CampaignCard v-for="f in currentUserFundraisers" :key="f.id" :campaign="f">
        <template #actions>
          <div class="flex gap-2">
            <NuxtLink :to="`/portal/fundraisers/${f.id}/edit`" class="flex-1">
              <Button variant="default" size="sm" class="w-full" as="span">
                <Pencil class="w-3.5 h-3.5 mr-1" />
                Edit Campaign
              </Button>
            </NuxtLink>
            <NuxtLink :to="`/portal/fundraisers/${f.id}`">
              <Button variant="outline" size="sm" as="span">
                Donations <ArrowRight class="w-3.5 h-3.5 ml-1" />
              </Button>
            </NuxtLink>
          </div>
        </template>
      </CampaignCard>
    </div>
  </div>
</template>
