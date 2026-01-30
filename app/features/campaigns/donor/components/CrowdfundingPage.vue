<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
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
}>()

// Dialog states
const showShareDialog = ref(false)
const showDonateDialog = ref(false)

// Story expand/collapse state
const isStoryExpanded = ref(false)
const storyPreviewLength = 200

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

// Check if any social sharing is enabled
const hasSocialSharing = computed(() => {
  if (!props.campaign.socialSharing) return false
  if (props.campaign.socialSharing.enabled === false) return false
  const { enabled, ...platforms } = props.campaign.socialSharing
  return Object.values(platforms).some((platformEnabled) => platformEnabled)
})
</script>

<template>
  <div v-if="campaign.crowdfunding" class="@container">
    <div class="bg-background rounded-xl border overflow-hidden">
      <!-- Hero Section: Cover Photo + Campaign Info -->
      <div class="@3xl:flex">
        <!-- Cover Photo - reaches top and left edges on desktop -->
        <div class="relative aspect-video @3xl:aspect-auto @3xl:w-3/5 bg-muted overflow-hidden">
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

        <!-- Campaign Info (right side on desktop) -->
        <div class="hidden @3xl:flex @3xl:w-2/5 p-6 @3xl:p-8 @3xl:pl-12 flex-col justify-center">
          <div class="space-y-4">
            <!-- Title & Description -->
            <div class="space-y-3">
              <h2 class="text-2xl font-bold leading-tight">
                {{ campaign.crowdfunding.title }}
              </h2>
              <p class="text-base text-muted-foreground leading-relaxed">
                {{ campaign.crowdfunding.shortDescription }}
              </p>
            </div>

            <!-- Progress Card -->
            <CampaignProgress
              v-if="
                campaign.crowdfunding.showProgressBar &&
                campaign.crowdfunding.goalAmount &&
                campaign.stats
              "
              :stats="campaign.stats"
              :goal-amount="campaign.crowdfunding.goalAmount"
            />

            <!-- Action Buttons -->
            <CampaignActions
              :show-share="hasSocialSharing"
              @donate="showDonateDialog = true"
              @share="showShareDialog = true"
            />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="p-4 @3xl:p-8">
        <!-- Title & Description (Mobile/Tablet only) -->
        <div class="@3xl:hidden space-y-3">
          <h2 class="text-xl font-bold leading-tight">
            {{ campaign.crowdfunding.title }}
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ campaign.crowdfunding.shortDescription }}
          </p>
        </div>

        <!-- Progress & Actions (Mobile/Tablet only) -->
        <div class="@3xl:hidden space-y-4 mt-4">
          <CampaignProgress
            v-if="
              campaign.crowdfunding.showProgressBar &&
              campaign.crowdfunding.goalAmount &&
              campaign.stats
            "
            :stats="campaign.stats"
            :goal-amount="campaign.crowdfunding.goalAmount"
          />

          <!-- Action Buttons -->
          <CampaignActions
            :show-share="hasSocialSharing"
            @donate="showDonateDialog = true"
            @share="showShareDialog = true"
          />
        </div>

        <Separator class="@3xl:hidden my-4" />

        <!-- Two-column layout for desktop -->
        <div class="@3xl:flex">
          <!-- Left Column: Story, Charity, Social -->
          <div class="flex-1 space-y-4">
            <!-- Story Section -->
            <div class="space-y-3">
              <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Our Story
              </h3>
              <div class="text-sm leading-relaxed whitespace-pre-line">
                {{ isStoryExpanded ? campaign.crowdfunding.story : storyPreview }}
              </div>
              <Button
                v-if="hasMoreStory"
                variant="ghost"
                size="sm"
                class="px-0 h-auto text-primary hover:underline"
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
              class="@3xl:hidden"
              :donations="displayedDonations"
              :total-count="campaign.stats?.totalDonations || 0"
              :default-view="campaign.crowdfunding.defaultDonationsView"
            />

            <Separator class="@3xl:hidden" />

            <!-- About the Charity -->
            <Card class="bg-muted/30 border-0">
              <CardHeader class="pb-2 pt-3 px-3">
                <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  About the Charity
                </h3>
              </CardHeader>
              <CardContent class="px-3 pb-3 space-y-2">
                <div>
                  <h4 class="font-semibold text-sm">{{ campaign.charity?.name }}</h4>
                  <p class="text-xs text-muted-foreground">
                    Registered Charity: {{ campaign.charity?.registrationNumber }}
                  </p>
                </div>
                <p class="text-sm text-muted-foreground line-clamp-3">
                  {{ campaign.charity?.description }}
                </p>
                <a
                  v-if="campaign.charity?.website"
                  :href="campaign.charity.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {{ campaign.charity.website.replace(/^https?:\/\//, '') }}
                  <ExternalLink class="w-3 h-3" />
                </a>
              </CardContent>
            </Card>

            <!-- Social Sharing (respects campaign.socialSharing settings) -->
            <div v-if="hasSocialSharing" class="space-y-3 pb-20 @3xl:pb-0">
              <h3
                class="font-semibold text-sm uppercase tracking-wide text-muted-foreground text-center"
              >
                Share this campaign
              </h3>
              <div class="flex justify-center gap-2 flex-wrap">
                <SocialShareButtons
                  :settings="campaign.socialSharing"
                  :campaign-id="campaign.id!"
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
                :donations="displayedDonations"
                :total-count="campaign.stats?.totalDonations || 0"
                :default-view="campaign.crowdfunding.defaultDonationsView"
              />
            </div>
          </aside>
        </div>
      </div>

      <!-- Dialogs -->
      <ShareDialog v-model:open="showShareDialog" />
      <DonateDialog v-model:open="showDonateDialog" />
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="bg-muted/50 rounded-xl border p-8 text-center">
    <Heart class="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
    <p class="text-muted-foreground">No campaign data loaded</p>
  </div>
</template>
