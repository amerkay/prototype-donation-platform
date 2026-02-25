<script setup lang="ts">
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import CrowdfundingPagePreview from '~/features/campaigns/admin/components/CrowdfundingPagePreview.vue'
import { useFundraisers } from '~/features/campaigns/admin/composables/useFundraisers'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { formatDate } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  ICON_DONATION,
  ICON_MORE_ACTIONS,
  ICON_COMPLETE,
  ICON_TERMINAL_STOP,
  ICON_REFUND,
  ICON_DONORS,
  ICON_SECTION_DONOR,
  ICON_CAMPAIGN
} from '~/lib/icons'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const {
  getFundraiserById,
  getParentName,
  completeFundraiser,
  endFundraiser,
  reactivateFundraiser
} = useFundraisers()
const { getCampaignById } = useCampaigns()
const { formatAmount, getProgressPercentage } = useCampaignFormatters()
const store = useCampaignConfigStore()
const { brandingStyle } = useBrandingCssVars()

const fundraiser = computed(() => getFundraiserById(route.params.id as string))

// The fundraiser's actual Campaign object (for preview)
const fundraiserCampaign = computed(() =>
  fundraiser.value ? getCampaignById(fundraiser.value.campaignId) : undefined
)

// Initialize campaign config store for preview
watchEffect(() => {
  if (fundraiserCampaign.value) {
    store.initialize(fundraiserCampaign.value)
  }
})

const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Peer to Peer' },
  { label: 'Fundraiser Pages', href: '/admin/p2p/fundraisers' },
  { label: fundraiser.value?.name ?? 'Not Found' }
])

const canComplete = computed(() => fundraiser.value?.status === 'active')
const canEnd = computed(() => fundraiser.value?.status === 'active')
const canReactivate = computed(() => fundraiser.value?.status !== 'active')
</script>

<template>
  <div v-if="!fundraiser" class="py-12 text-center">
    <p class="text-muted-foreground">Fundraiser not found.</p>
  </div>

  <EditLayout v-else :breadcrumbs="breadcrumbs" :is-dirty="false">
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 px-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold">{{ fundraiser.name }}</h1>
            <StatusBadge :status="fundraiser.status" />
          </div>
          <p class="text-sm text-muted-foreground">
            {{ fundraiser.email }} · Created {{ formatDate(fundraiser.createdAt) }}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm">
              <ICON_MORE_ACTIONS class="size-4 mr-1.5" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem v-if="canReactivate" @click="reactivateFundraiser(fundraiser!.id)">
              <ICON_REFUND class="size-4 mr-2" /> Reactivate
            </DropdownMenuItem>
            <DropdownMenuItem v-if="canComplete" @click="completeFundraiser(fundraiser!.id)">
              <ICON_COMPLETE class="size-4 mr-2" /> Complete
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="canEnd"
              class="text-destructive focus:text-destructive"
              @click="endFundraiser(fundraiser!.id)"
            >
              <ICON_TERMINAL_STOP class="size-4 mr-2" /> End
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Fundraiser Info -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <ICON_SECTION_DONOR class="size-4" /> Fundraiser Info
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm">
            <AdminDetailRow label="Name" :value="fundraiser.name" />
            <AdminDetailRow label="Email" :value="fundraiser.email" />
            <AdminDetailRow label="Slug" :value="fundraiser.slug" />
            <AdminDetailRow label="Created" :value="formatDate(fundraiser.createdAt)" />
            <AdminDetailRow
              v-if="fundraiser.completedAt"
              label="Completed"
              :value="formatDate(fundraiser.completedAt)"
            />
            <AdminDetailRow label="Template">
              <NuxtLink
                :to="`/admin/p2p/templates/${fundraiser.parentCampaignId}`"
                class="text-primary hover:underline"
              >
                {{ getParentName(fundraiser.parentCampaignId) }}
              </NuxtLink>
            </AdminDetailRow>
          </CardContent>
        </Card>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4">
          <Card>
            <CardContent class="pt-0">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-muted p-2">
                  <ICON_DONATION class="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p class="text-2xl font-bold">{{ fundraiser.donationCount }}</p>
                  <p class="text-xs text-muted-foreground">Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent class="pt-0">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-muted p-2">
                  <ICON_DONORS class="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p class="text-2xl font-bold">
                    {{ formatAmount(fundraiser.raisedAmount, fundraiser.currency) }}
                  </p>
                  <p class="text-xs text-muted-foreground">Raised</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Progress -->
        <Card v-if="fundraiser.goal">
          <CardContent class="pt-0">
            <div class="space-y-3">
              <div class="flex items-baseline justify-between gap-4">
                <div>
                  <p class="text-2xl font-bold">
                    {{ formatAmount(fundraiser.raisedAmount, fundraiser.currency) }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    of {{ formatAmount(fundraiser.goal, fundraiser.currency) }} goal
                  </p>
                </div>
                <p class="text-xl font-bold text-muted-foreground">
                  {{ Math.round(getProgressPercentage(fundraiser.raisedAmount, fundraiser.goal)) }}%
                </p>
              </div>
              <Progress
                :model-value="getProgressPercentage(fundraiser.raisedAmount, fundraiser.goal)"
                class="h-2.5"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <template #preview>
      <div v-if="fundraiserCampaign" :style="brandingStyle">
        <CrowdfundingPagePreview :editable="false" />
      </div>
      <div v-else class="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
        <ICON_CAMPAIGN class="size-8 mx-auto mb-2 opacity-40" />
        <p>Preview unavailable</p>
      </div>
    </template>
  </EditLayout>
</template>
