<script setup lang="ts">
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import AdminDetailRow from '~/features/_admin/components/AdminDetailRow.vue'
import CrowdfundingPagePreview from '~/features/campaigns/features/crowdfunding/admin/components/CrowdfundingPagePreview.vue'
import { useFundraisers } from '~/features/campaigns/features/p2p/admin/composables/useFundraisers'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { formatDate } from '~/lib/formatDate'
import StatusBadge from '~/components/StatusBadge.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import CampaignProgress from '~/features/campaigns/features/crowdfunding/donor/components/CampaignProgress.vue'
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
const { formatAmount } = useCampaignFormatters()
const charityStore = useCharitySettingsStore()
const store = useCampaignConfigStore()
const { brandingStyle } = useBrandingCssVars()

const fundraiser = computed(() => getFundraiserById(route.params.id as string))

// The fundraiser's Campaign object (auto-merged with parent template via getCampaignById)
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

const handlePreview = () => {
  window.open(`/${charityStore.slug}/campaign/${fundraiser.value?.campaignId}`, '_blank')
}
</script>

<template>
  <div v-if="!fundraiser" class="py-12 text-center">
    <p class="text-muted-foreground">Fundraiser not found.</p>
  </div>

  <EditLayout
    v-else
    :breadcrumbs="breadcrumbs"
    :is-dirty="false"
    preview-label="Preview"
    @preview="handlePreview"
  >
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

        <!-- Progress (with matched giving from parent campaign) -->
        <Card v-if="fundraiser.goal && fundraiserCampaign">
          <CardContent class="pt-0">
            <CampaignProgress
              :stats="fundraiserCampaign.stats"
              :goal-amount="fundraiser.goal"
              :end-date="fundraiserCampaign.crowdfunding.endDate"
              :matched-giving="fundraiserCampaign.matchedGiving"
              hide-footer
            />
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
