<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { fundraiserDonationColumns } from '~/features/donor-portal/columns/fundraiserDonationColumns'
import AdminBreadcrumbBar from '~/features/_admin/components/AdminBreadcrumbBar.vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
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
import { ExternalLink, Megaphone, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { formatAmount, getProgressPercentage } = useCampaignFormatters()
const { currentUserFundraisers } = useDonorPortal()

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
          <EmptyTitle>Fundraiser Not Found</EmptyTitle>
          <EmptyDescription>
            The fundraiser you're looking for doesn't exist or has been removed.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NuxtLink to="/portal/fundraisers">
            <Button variant="outline">Back to Fundraisers</Button>
          </NuxtLink>
        </EmptyContent>
      </Empty>

      <template v-else>
        <!-- Header -->
        <div class="space-y-1.5">
          <div class="flex items-start justify-between gap-4">
            <h1 class="text-2xl font-semibold tracking-tight">{{ fundraiser.name }}</h1>
            <Badge
              variant="outline"
              :data-campaign-status="fundraiser.status"
              class="shrink-0 border-(--cs-border) text-(--cs-text)"
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
        <div class="flex gap-2">
          <NuxtLink :to="`/portal/fundraisers/${fundraiser.id}/edit`">
            <Button variant="default" size="sm" as="span">
              <Pencil class="w-3.5 h-3.5 mr-1" />
              Edit Campaign
            </Button>
          </NuxtLink>
          <NuxtLink :to="`/donor/campaign/${fundraiser.id}`">
            <Button variant="outline" size="sm" as="span">
              <ExternalLink class="w-3.5 h-3.5 mr-1" />
              View Page
            </Button>
          </NuxtLink>
        </div>

        <!-- Stats + Progress -->
        <div class="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent class="pt-0 space-y-2">
              <div v-if="fundraiser.crowdfunding.goalAmount" class="space-y-1">
                <div class="flex justify-between text-sm">
                  <span class="font-medium">
                    {{ formatAmount(fundraiser.stats.totalRaised, fundraiser.stats.currency) }}
                    raised
                  </span>
                  <span class="text-muted-foreground">
                    of {{ formatAmount(fundraiser.crowdfunding.goalAmount) }}
                  </span>
                </div>
                <Progress
                  :model-value="
                    getProgressPercentage(
                      fundraiser.stats.totalRaised,
                      fundraiser.crowdfunding.goalAmount
                    )
                  "
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Stats</CardDescription>
            </CardHeader>
            <CardContent class="pt-0">
              <div class="grid grid-cols-3 gap-4 text-sm text-center">
                <div>
                  <p class="text-lg font-semibold">{{ fundraiser.stats.totalDonations }}</p>
                  <p class="text-xs text-muted-foreground">donations</p>
                </div>
                <div>
                  <p class="text-lg font-semibold">{{ fundraiser.stats.totalDonors }}</p>
                  <p class="text-xs text-muted-foreground">donors</p>
                </div>
                <div>
                  <p class="text-lg font-semibold">
                    {{ formatAmount(fundraiser.stats.averageDonation, fundraiser.stats.currency) }}
                  </p>
                  <p class="text-xs text-muted-foreground">avg</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
