<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import type { SocialSharingSettings } from '~/features/settings/admin/stores/socialSharingSettings'
import {
  useBrandingCssVars,
  BRANDING_STYLE_KEY
} from '~/features/settings/admin/composables/useBrandingCssVars'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import ShareDialog from './ShareDialog.vue'
import DonateDialog from './DonateDialog.vue'
import SocialShareButtons from './SocialShareButtons.vue'
import DonationsList from './DonationsList.vue'
import CampaignProgress from './CampaignProgress.vue'
import CampaignActions from './CampaignActions.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Heart, ChevronDown, ChevronUp, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
  currency?: string
  /** Charity field targets for click-to-edit in admin preview context */
  targets?: Record<string, string>
}>()

// Provide branding to teleported modals (ShareDialog, DonateDialog)
const { brandingStyle } = useBrandingCssVars()
provide(BRANDING_STYLE_KEY, brandingStyle)

const charityStore = useCharitySettingsStore()
const currencyStore = useCurrencySettingsStore()
const charityInfo = computed(() =>
  charityStore.getCharityForCurrency(props.currency ?? currencyStore.defaultCurrency)
)
const orgSharing = useSocialSharingSettingsStore()
const { campaignUrl } = useCampaignShare(computed(() => props.campaign.id))

// Effective sharing: campaign must enable sharing, then org-level controls which platforms
const effectiveSharing = computed<(SocialSharingSettings & { copyLink: boolean }) | null>(() => {
  if (!props.campaign.crowdfunding?.enableSocialSharing) return null
  return {
    facebook: orgSharing.facebook,
    twitter: orgSharing.twitter,
    linkedin: orgSharing.linkedin,
    whatsapp: orgSharing.whatsapp,
    email: orgSharing.email,
    copyLink: true
  }
})

// Dialog states
const showShareDialog = ref(false)
const showDonateDialog = ref(false)

// Story expand/collapse state
const isStoryExpanded = ref(false)
const storyPreviewLength = 350

// Computed for story preview
const storyPreview = computed(() => {
  const story = props.campaign.crowdfunding?.story || ''
  if (story.length <= storyPreviewLength) return story
  return story.slice(0, storyPreviewLength).trim() + '...'
})

const hasMoreStory = computed(() => {
  return (props.campaign.crowdfunding?.story?.length || 0) > storyPreviewLength
})

// Get limited donations for display
const displayedDonations = computed(() => {
  const limit = props.campaign.crowdfunding?.numberOfDonationsToShow || 5
  return props.campaign.recentDonations.slice(0, limit)
})

// Handle social share click
const handleSocialShare = (platform: string) => {
  if (platform === 'copyLink') {
    showShareDialog.value = true
  }
}

// Check if any social sharing is enabled (respects both org + campaign settings)
const hasSocialSharing = computed(() => {
  const s = effectiveSharing.value
  if (!s) return false
  return s.facebook || s.twitter || s.linkedin || s.whatsapp || s.email || s.copyLink
})
</script>

<template>
  <div v-if="campaign.crowdfunding" class="@container">
    <div class="bg-background rounded-xl border overflow-hidden">
      <!-- Hero Section: Cover Photo + Campaign Info -->
      <div class="@3xl:flex @3xl:mb-8">
        <!-- Cover Photo - reaches top and left edges on desktop -->
        <div
          data-field="crowdfunding.coverPhoto"
          class="relative aspect-video @3xl:aspect-auto @3xl:w-3/5 bg-muted overflow-hidden"
        >
          <img
            v-if="campaign.crowdfunding.coverPhoto"
            :src="campaign.crowdfunding.coverPhoto"
            :alt="campaign.crowdfunding.title"
            class="w-full h-full object-cover @3xl:min-h-80"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 @3xl:min-h-80"
          >
            <Heart class="w-12 h-12 @3xl:w-20 @3xl:h-20 text-primary/40" />
          </div>
        </div>

        <!-- Campaign Info -->
        <div
          class="p-4 space-y-3 @3xl:w-2/5 @3xl:p-8 @3xl:pl-12 @3xl:flex @3xl:flex-col @3xl:justify-center @3xl:space-y-4"
        >
          <h2 data-field="crowdfunding.title" class="text-xl @3xl:text-2xl font-bold leading-tight">
            {{ campaign.crowdfunding.title }}
          </h2>
          <p
            data-field="crowdfunding.shortDescription"
            class="text-sm @3xl:text-base text-muted-foreground leading-relaxed"
          >
            {{ campaign.crowdfunding.shortDescription }}
          </p>
          <CampaignProgress
            v-if="
              campaign.crowdfunding.showProgressBar &&
              campaign.crowdfunding.goalAmount &&
              campaign.stats
            "
            data-field="crowdfunding.goalAmount"
            :stats="campaign.stats"
            :goal-amount="campaign.crowdfunding.goalAmount"
            :end-date="campaign.crowdfunding.endDate"
          />
          <CampaignActions
            :show-share="hasSocialSharing"
            @donate="showDonateDialog = true"
            @share="showShareDialog = true"
          />
        </div>
      </div>

      <!-- Main Content -->
      <div class="px-4 pb-4 @3xl:p-8 @3xl:pt-0">
        <Separator class="@3xl:hidden mb-4" />

        <!-- Two-column layout for desktop -->
        <div class="@3xl:flex">
          <!-- Left Column: Story, Charity, Social -->
          <div class="flex-1 space-y-4">
            <!-- Story Section -->
            <div data-field="crowdfunding.story" class="space-y-3">
              <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Our Story
              </h3>
              <div class="text-sm leading-relaxed whitespace-pre-line">
                {{ isStoryExpanded ? campaign.crowdfunding.story : storyPreview }}
              </div>
              <Button
                v-if="hasMoreStory"
                variant="outline"
                size="sm"
                class="text-primary"
                @click="isStoryExpanded = !isStoryExpanded"
              >
                {{ isStoryExpanded ? 'Read less' : 'Read more' }}
                <ChevronUp v-if="isStoryExpanded" class="w-4 h-4 ml-1" />
                <ChevronDown v-else class="w-4 h-4 ml-1" />
              </Button>
            </div>

            <Separator class="@3xl:hidden" />

            <!-- Recent Donations (Mobile/Tablet only - moves to right column on desktop) -->
            <DonationsList
              v-if="campaign.crowdfunding.showRecentDonations"
              data-field="crowdfunding.showRecentDonations"
              class="@3xl:hidden"
              :donations="displayedDonations"
              :total-count="campaign.stats?.totalDonations || 0"
              :default-view="campaign.crowdfunding.defaultDonationsView"
            />

            <Separator class="@3xl:hidden" />

            <!-- About the Charity -->
            <Card data-field="crowdfunding.charityNotice" class="gap-2">
              <CardHeader class="pb-0 px-5">
                <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  About the Charity
                </h3>
              </CardHeader>
              <CardContent class="px-5 space-y-2">
                <div
                  :data-field="
                    [targets?.charityName, targets?.phone, targets?.email]
                      .filter(Boolean)
                      .join(',') || undefined
                  "
                >
                  <h4 class="font-semibold text-sm">{{ charityInfo.name }}</h4>
                  <p class="text-xs text-muted-foreground">
                    Registered Charity: {{ charityInfo.registrationNumber }}
                  </p>
                </div>
                <p
                  v-if="charityInfo.address"
                  class="text-xs text-muted-foreground"
                  :data-field="targets?.charityAddress"
                >
                  {{ charityInfo.address }}
                </p>
                <p
                  class="text-sm text-muted-foreground line-clamp-3"
                  :data-field="targets?.description"
                >
                  {{ charityInfo.description }}
                </p>
                <a
                  v-if="charityInfo.website"
                  :href="charityInfo.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  :data-field="targets?.website"
                >
                  {{ charityInfo.website.replace(/^https?:\/\//, '') }}
                  <ExternalLink class="w-3 h-3" />
                </a>
              </CardContent>
            </Card>

            <!-- Social Sharing (respects campaign + org-level settings) -->
            <div
              v-if="hasSocialSharing"
              class="space-y-3 pb-4 @3xl:pb-0"
              data-field="crowdfunding.enableSocialSharing"
            >
              <h3
                class="font-semibold text-sm uppercase tracking-wide text-muted-foreground text-center"
              >
                Share this campaign
              </h3>
              <div class="flex justify-center gap-2 flex-wrap">
                <SocialShareButtons
                  :settings="effectiveSharing"
                  :campaign-url="campaignUrl"
                  :campaign-title="campaign.crowdfunding?.title || campaign.name"
                  :short-description="campaign.crowdfunding?.shortDescription"
                  size="icon"
                  @share="handleSocialShare"
                />
              </div>
            </div>
          </div>

          <!-- Right Column: Recent Donations (Desktop only) -->
          <aside
            v-if="campaign.crowdfunding.showRecentDonations"
            class="hidden @3xl:block @3xl:w-2/5 @3xl:pl-10 shrink-0"
          >
            <div class="sticky top-6">
              <DonationsList
                data-field="crowdfunding.showRecentDonations"
                :donations="displayedDonations"
                :total-count="campaign.stats?.totalDonations || 0"
                :default-view="campaign.crowdfunding.defaultDonationsView"
              />
            </div>
          </aside>
        </div>
      </div>

      <!-- Dialogs -->
      <ShareDialog v-model:open="showShareDialog" :campaign="campaign" />
      <DonateDialog v-model:open="showDonateDialog" :campaign-id="campaign.id!" />
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="bg-muted/50 rounded-xl border p-8 text-center">
    <Heart class="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
    <p class="text-muted-foreground">No campaign data loaded</p>
  </div>
</template>
