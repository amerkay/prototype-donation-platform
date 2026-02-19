<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import CampaignCard from '~/features/campaigns/admin/components/CampaignCard.vue'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { ArrowRight, Megaphone, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const { currentUserFundraisers } = useDonorPortal()
const charityStore = useCharitySettingsStore()
</script>

<template>
  <div>
    <AdminBreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'My Fundraisers' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">My Fundraisers</h1>
        <p class="text-sm text-muted-foreground">Campaigns you've started and how they're doing.</p>
      </div>

      <Empty v-if="currentUserFundraisers.length === 0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Megaphone />
          </EmptyMedia>
          <EmptyTitle>No fundraisers yet</EmptyTitle>
          <EmptyDescription>
            When you create a fundraising page, it'll appear here so you can track donations and
            share it.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink :to="`/${charityStore.slug}/p2p-templates`">
            <Button>Browse P2P Templates</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <div v-else class="grid gap-6 sm:grid-cols-2">
        <CampaignCard
          v-for="f in currentUserFundraisers"
          :key="f.id"
          :campaign="f"
          :href="`/portal/fundraisers/${f.id}`"
        >
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
  </div>
</template>
