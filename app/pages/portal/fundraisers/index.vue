<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
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
</script>

<template>
  <div>
    <AdminBreadcrumbBar
      :items="[{ label: 'Dashboard', href: '/portal' }, { label: 'My Fundraisers' }]"
    />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <div class="space-y-1.5">
        <h1 class="text-2xl font-semibold tracking-tight">My Fundraisers</h1>
        <p class="text-sm text-muted-foreground">
          Your peer-to-peer fundraising campaigns and their donations.
        </p>
      </div>

      <Empty v-if="currentUserFundraisers.length === 0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Megaphone />
          </EmptyMedia>
          <EmptyTitle>No Fundraisers</EmptyTitle>
          <EmptyDescription>
            You haven't created any fundraisers yet. Visit P2P templates to create your first
            fundraiser.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink to="/donor/p2p-templates">
            <Button>Browse P2P Templates</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <div v-else class="grid gap-6 sm:grid-cols-2">
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
  </div>
</template>
