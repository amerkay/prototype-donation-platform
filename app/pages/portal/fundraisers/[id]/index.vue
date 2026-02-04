<script setup lang="ts">
import { useDonorPortal } from '~/features/donor-portal/composables/useDonorPortal'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import DataTable from '~/features/donor-portal/components/DataTable.vue'
import { fundraiserDonationColumns } from '~/features/donor-portal/columns/fundraiserDonationColumns'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ExternalLink, Pencil } from 'lucide-vue-next'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { formatAmount, getProgressPercentage } = useCampaignFormatters()
const { currentUserFundraisers } = useDonorPortal()

const fundraiser = computed(() =>
  currentUserFundraisers.value.find((f) => f.id === route.params.id)
)
</script>

<template>
  <div class="flex flex-1 flex-col px-4 pt-0 pb-4">
    <!-- Not found -->
    <div v-if="!fundraiser" class="text-center py-12">
      <p class="text-muted-foreground">Fundraiser not found.</p>
      <NuxtLink to="/portal/fundraisers" class="mt-4 inline-block">
        <Button variant="outline">Back to Fundraisers</Button>
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="py-4 flex items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <NuxtLink to="/portal/fundraisers">
              <Button variant="ghost" size="sm" class="-ml-2">
                <ArrowLeft class="w-4 h-4 mr-1" />
                Back
              </Button>
            </NuxtLink>
          </div>
          <h1 class="text-xl font-semibold tracking-tight">{{ fundraiser.name }}</h1>
          <p class="text-sm text-muted-foreground">
            {{ fundraiser.crowdfunding.shortDescription }}
          </p>
        </div>
        <Badge
          variant="outline"
          :data-campaign-status="fundraiser.status"
          class="shrink-0 border-(--cs-border) text-(--cs-text)"
        >
          <span class="size-1.5 shrink-0 rounded-full bg-(--cs-dot)" />
          {{ fundraiser.status }}
        </Badge>
      </div>

      <!-- Stats + Progress -->
      <div class="grid gap-4 sm:grid-cols-2 pb-4">
        <Card>
          <CardHeader class="p-4 pb-2">
            <CardDescription class="text-xs">Progress</CardDescription>
          </CardHeader>
          <CardContent class="p-4 pt-0 space-y-2">
            <div v-if="fundraiser.crowdfunding.goalAmount" class="space-y-1">
              <div class="flex justify-between text-sm">
                <span class="font-medium">
                  {{ formatAmount(fundraiser.stats.totalRaised) }} raised
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
          <CardHeader class="p-4 pb-2">
            <CardDescription class="text-xs">Stats</CardDescription>
          </CardHeader>
          <CardContent class="p-4 pt-0">
            <div class="grid grid-cols-3 gap-2 text-sm text-center">
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
                  {{ formatAmount(fundraiser.stats.averageDonation) }}
                </p>
                <p class="text-xs text-muted-foreground">avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pb-4">
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

      <!-- Donations table (limited view) -->
      <div class="space-y-2">
        <h2 class="text-sm font-medium">Donations Received</h2>
        <DataTable
          :columns="fundraiserDonationColumns"
          :data="fundraiser.recentDonations"
          :page-size="10"
        />
      </div>
    </template>
  </div>
</template>
