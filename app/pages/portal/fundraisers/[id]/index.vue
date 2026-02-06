<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { fundraiserDonationColumns } from '~/features/donor-portal/columns/fundraiserDonationColumns'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import StatsCard from '@/components/StatsCard.vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty'
import { ExternalLink, Heart, Megaphone, Pencil, Users } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { formatAmount, getProgressPercentage } = useCampaignFormatters()
const { currentUserFundraisers } = useDonorPortal()
const charityStore = useCharitySettingsStore()

const fundraiser = computed(() =>
  currentUserFundraisers.value.find((f) => f.id === route.params.id)
)

const breadcrumbItems = computed(() => {
  if (!fundraiser.value) {
    return [
      { label: 'Dashboard', href: '/portal' },
      { label: 'My Fundraisers', href: '/portal/fundraisers' },
      { label: 'Not Found' }
    ]
  }
  return [
    { label: 'Dashboard', href: '/portal' },
    { label: 'My Fundraisers', href: '/portal/fundraisers' },
    { label: fundraiser.value.name }
  ]
})
</script>

<template>
  <div>
    <AdminBreadcrumbBar :items="breadcrumbItems" />
    <div class="flex flex-1 flex-col gap-6 px-4 py-2 pb-8 sm:px-6">
      <!-- Not found -->
      <Empty v-if="!fundraiser">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Megaphone />
          </EmptyMedia>
          <EmptyTitle>Can't find this fundraiser</EmptyTitle>
          <EmptyDescription> It may have been removed or the link is incorrect. </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink to="/portal/fundraisers">
            <Button variant="outline">Back to Fundraisers</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <template v-else>
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-1.5">
            <div>
              <h1 class="inline text-2xl font-semibold tracking-tight">
                {{ fundraiser.name }}
              </h1>
              <Badge
                variant="outline"
                :data-campaign-status="fundraiser.status"
                class="inline-block ml-3 align-text-bottom border-(--cs-border) text-(--cs-text)"
              >
                <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
                {{ fundraiser.status }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground">
              {{ fundraiser.crowdfunding.shortDescription }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 sm:shrink-0">
            <NuxtLink :to="`/portal/fundraisers/${fundraiser.id}/edit`">
              <Button variant="default" size="sm" as="span">
                <Pencil class="w-3.5 h-3.5 mr-1" />
                Edit Campaign
              </Button>
            </NuxtLink>
            <NuxtLink :to="`/${charityStore.slug}/campaign/${fundraiser.id}`">
              <Button variant="outline" size="sm" as="span">
                <ExternalLink class="w-3.5 h-3.5 mr-1" />
                View Page
              </Button>
            </NuxtLink>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-4 my-2">
          <!-- Progress -->
          <Card v-if="fundraiser.crowdfunding.goalAmount" class="col-span-2">
            <CardContent>
              <div class="space-y-3">
                <div class="flex items-baseline justify-between gap-4">
                  <div>
                    <p class="text-3xl font-bold tracking-tight">
                      {{ formatAmount(fundraiser.stats.totalRaised, fundraiser.stats.currency) }}
                    </p>
                    <p class="text-sm text-muted-foreground mt-0.5">
                      raised of {{ formatAmount(fundraiser.crowdfunding.goalAmount) }} goal
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-muted-foreground">
                      {{
                        Math.round(
                          getProgressPercentage(
                            fundraiser.stats.totalRaised,
                            fundraiser.crowdfunding.goalAmount
                          )
                        )
                      }}%
                    </p>
                    <p class="text-xs text-muted-foreground">complete</p>
                  </div>
                </div>
                <Progress
                  :model-value="
                    getProgressPercentage(
                      fundraiser.stats.totalRaised,
                      fundraiser.crowdfunding.goalAmount
                    )
                  "
                  class="h-3 mt-4 sm:mt-7"
                />
              </div>
            </CardContent>
          </Card>
          <StatsCard :icon="Heart" label="Donations" :value="fundraiser.stats.totalDonations" />
          <StatsCard :icon="Users" label="Donors" :value="fundraiser.stats.totalDonors" />
        </div>

        <!-- Donations table -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold tracking-tight">Donations Received</h2>
          <DataTable
            :columns="fundraiserDonationColumns"
            :data="fundraiser.recentDonations"
            :page-size="10"
          />
        </div>
      </template>
    </div>
  </div>
</template>
