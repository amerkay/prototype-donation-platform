<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import ShareDialog from '../../donor/components/ShareDialog.vue'
import DonateDialog from '../../donor/components/DonateDialog.vue'
import SocialShareButtons from '../../donor/components/SocialShareButtons.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Heart, Share2, ChevronDown, ChevronUp, ExternalLink } from 'lucide-vue-next'

const store = useCampaignConfigStore()

// Dialog states
const showShareDialog = ref(false)
const showDonateDialog = ref(false)

// Story expand/collapse state
const isStoryExpanded = ref(false)
const storyPreviewLength = 200

// Donations view toggle
const currentDonationsView = ref<'recent' | 'top'>('recent')

// Initialize with store's default view
watch(
  () => store.crowdfunding?.defaultDonationsView,
  (view) => {
    if (view) currentDonationsView.value = view
  },
  { immediate: true }
)

// Computed for story preview
const storyPreview = computed(() => {
  const story = store.crowdfunding?.story || ''
  if (story.length <= storyPreviewLength) return story
  return story.slice(0, storyPreviewLength).trim() + '...'
})

const hasMoreStory = computed(() => {
  return (store.crowdfunding?.story?.length || 0) > storyPreviewLength
})

// Get sorted donations based on current view
const displayedDonations = computed(() => {
  const limit = store.crowdfunding?.numberOfDonationsToShow || 5
  const donations = [...store.recentDonations]

  if (currentDonationsView.value === 'top') {
    donations.sort((a, b) => b.amount - a.amount)
  } else {
    donations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return donations.slice(0, limit)
})

// Formatting helpers
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatRelativeTime = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date)
}

const getDonorInitials = (name: string) => {
  if (name === 'Anonymous') return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Handle social share click
const handleSocialShare = (platform: string) => {
  if (platform === 'copyLink') {
    showShareDialog.value = true
  }
}

// Check if any social sharing is enabled
const hasSocialSharing = computed(() => {
  if (!store.socialSharing) return false
  return Object.values(store.socialSharing).some((enabled) => enabled)
})
</script>

<template>
  <div v-if="store.crowdfunding" class="@container">
    <div class="bg-background rounded-xl border overflow-hidden">
      <!-- Cover Photo -->
      <div class="relative aspect-video @4xl:aspect-21/9 bg-muted overflow-hidden">
        <img
          v-if="store.crowdfunding.coverPhoto"
          :src="store.crowdfunding.coverPhoto"
          :alt="store.crowdfunding.title"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5"
        >
          <Heart class="w-12 h-12 @md:w-16 @md:h-16 @4xl:w-20 @4xl:h-20 text-primary/40" />
        </div>
      </div>

      <!-- Content Container -->
      <div class="@4xl:flex @4xl:gap-6 @4xl:p-6">
        <!-- Main Content -->
        <div class="flex-1 p-4 @md:p-6 @4xl:p-0 space-y-4 @md:space-y-5">
          <!-- Title & Description (Mobile/Tablet only) -->
          <div class="@4xl:hidden space-y-3">
            <h2 class="text-xl @md:text-2xl font-bold leading-tight">
              {{ store.crowdfunding.title }}
            </h2>
            <p class="text-sm @md:text-base text-muted-foreground leading-relaxed">
              {{ store.crowdfunding.shortDescription }}
            </p>
          </div>

          <!-- Progress & Actions (Mobile/Tablet only) -->
          <div class="@4xl:hidden space-y-4">
            <div
              v-if="store.crowdfunding.showProgressBar && store.stats?.goalAmount"
              class="space-y-2"
            >
              <Progress :model-value="store.progressPercentage" class="h-3" />
              <div class="flex justify-between items-baseline text-sm @md:text-base">
                <div>
                  <span class="font-bold text-lg @md:text-xl">{{
                    formatAmount(store.stats.totalRaised)
                  }}</span>
                  <span class="text-muted-foreground"> raised</span>
                </div>
                <div class="text-muted-foreground text-right text-sm">
                  <span>{{ formatAmount(store.stats.goalAmount) }} goal</span>
                </div>
              </div>
              <div class="flex justify-between text-xs @md:text-sm text-muted-foreground">
                <span>{{ store.stats.totalDonors }} supporters</span>
                <span v-if="store.stats.daysRemaining"
                  >{{ store.stats.daysRemaining }} days left</span
                >
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <Button class="flex-1" size="lg" @click="showDonateDialog = true">
                <Heart class="w-4 h-4 mr-2" />
                Donate Now
              </Button>
              <Button variant="outline" size="lg" @click="showShareDialog = true">
                <Share2 class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Separator class="@4xl:hidden" />

          <!-- Story Section -->
          <div class="space-y-3">
            <h3
              class="font-semibold text-sm @md:text-base uppercase tracking-wide text-muted-foreground"
            >
              Our Story
            </h3>
            <div class="text-sm @md:text-base leading-relaxed whitespace-pre-line">
              {{ isStoryExpanded ? store.crowdfunding.story : storyPreview }}
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

          <Separator />

          <!-- Recent Donations -->
          <div v-if="store.crowdfunding.showRecentDonations" class="space-y-3">
            <div class="flex items-center justify-between">
              <h3
                class="font-semibold text-sm @md:text-base uppercase tracking-wide text-muted-foreground"
              >
                {{ currentDonationsView === 'recent' ? 'Recent' : 'Top' }} Donations
              </h3>
              <div class="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 @md:h-8 px-2 @md:px-3 text-xs @md:text-sm"
                  :class="{ 'bg-muted': currentDonationsView === 'recent' }"
                  @click="currentDonationsView = 'recent'"
                >
                  Recent
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 @md:h-8 px-2 @md:px-3 text-xs @md:text-sm"
                  :class="{ 'bg-muted': currentDonationsView === 'top' }"
                  @click="currentDonationsView = 'top'"
                >
                  Top
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <div
                v-for="donation in displayedDonations"
                :key="donation.id"
                class="flex items-start gap-3 p-2 @md:p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar class="w-8 h-8 @md:w-10 @md:h-10 shrink-0">
                  <AvatarFallback class="text-xs @md:text-sm bg-primary/10 text-primary">
                    {{ getDonorInitials(donation.isAnonymous ? 'Anonymous' : donation.donorName) }}
                  </AvatarFallback>
                </Avatar>
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline justify-between gap-2">
                    <span class="font-medium text-sm @md:text-base truncate">
                      {{ donation.isAnonymous ? 'Anonymous' : donation.donorName }}
                    </span>
                    <span class="text-sm @md:text-base font-semibold text-primary shrink-0">
                      {{ formatAmount(donation.amount) }}
                    </span>
                  </div>
                  <p
                    v-if="donation.message"
                    class="text-xs @md:text-sm text-muted-foreground line-clamp-2 mt-0.5"
                  >
                    "{{ donation.message }}"
                  </p>
                  <span class="text-xs @md:text-sm text-muted-foreground">
                    {{ formatRelativeTime(donation.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <p class="text-xs @md:text-sm text-center text-muted-foreground pt-1">
              {{ store.stats?.totalDonations }} total donations
            </p>
          </div>

          <Separator />

          <!-- About the Charity -->
          <Card class="bg-muted/30 border-0">
            <CardHeader class="pb-2 pt-3 @md:pt-4 px-3 @md:px-4">
              <h3
                class="font-semibold text-sm @md:text-base uppercase tracking-wide text-muted-foreground"
              >
                About the Charity
              </h3>
            </CardHeader>
            <CardContent class="px-3 @md:px-4 pb-3 @md:pb-4 space-y-2">
              <div>
                <h4 class="font-semibold text-sm @md:text-base">{{ store.charity?.name }}</h4>
                <p class="text-xs @md:text-sm text-muted-foreground">
                  Registered Charity: {{ store.charity?.registrationNumber }}
                </p>
              </div>
              <p class="text-sm @md:text-base text-muted-foreground line-clamp-3">
                {{ store.charity?.description }}
              </p>
              <a
                v-if="store.charity?.website"
                :href="store.charity.website"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-sm @md:text-base text-primary hover:underline"
              >
                {{ store.charity.website.replace(/^https?:\/\//, '') }}
                <ExternalLink class="w-3 h-3 @md:w-4 @md:h-4" />
              </a>
            </CardContent>
          </Card>

          <!-- Social Sharing (respects store.socialSharing settings) -->
          <div v-if="hasSocialSharing" class="space-y-3 pb-20 @4xl:pb-0">
            <h3
              class="font-semibold text-sm @md:text-base uppercase tracking-wide text-muted-foreground text-center"
            >
              Share this campaign
            </h3>
            <div class="flex justify-center gap-2 flex-wrap">
              <SocialShareButtons
                :settings="store.socialSharing"
                :campaign-id="store.id!"
                :campaign-title="store.crowdfunding?.title || store.name"
                :short-description="store.crowdfunding?.shortDescription"
                size="icon"
                @share="handleSocialShare"
              />
            </div>
          </div>
        </div>

        <!-- Desktop Sidebar -->
        <aside class="hidden @4xl:block @4xl:w-85 @5xl:w-95 shrink-0">
          <div class="sticky top-6 space-y-4">
            <!-- Title & Description -->
            <div class="space-y-3">
              <h2 class="text-2xl @5xl:text-3xl font-bold leading-tight">
                {{ store.crowdfunding.title }}
              </h2>
              <p class="text-base text-muted-foreground leading-relaxed">
                {{ store.crowdfunding.shortDescription }}
              </p>
            </div>

            <!-- Progress Card -->
            <Card v-if="store.crowdfunding.showProgressBar && store.stats?.goalAmount">
              <CardContent class="p-5 space-y-4">
                <Progress :model-value="store.progressPercentage" class="h-3" />
                <div class="space-y-2">
                  <div class="flex justify-between items-baseline">
                    <div>
                      <div class="font-bold text-2xl">
                        {{ formatAmount(store.stats.totalRaised) }}
                      </div>
                      <div class="text-sm text-muted-foreground">
                        raised of {{ formatAmount(store.stats.goalAmount) }}
                      </div>
                    </div>
                  </div>
                  <div class="flex gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <div>
                      <span class="font-semibold text-foreground">{{
                        store.stats.totalDonors
                      }}</span>
                      supporters
                    </div>
                    <div v-if="store.stats.daysRemaining">
                      <span class="font-semibold text-foreground">{{
                        store.stats.daysRemaining
                      }}</span>
                      days left
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Action Buttons -->
            <div class="space-y-2">
              <Button class="w-full" size="lg" @click="showDonateDialog = true">
                <Heart class="w-4 h-4 mr-2" />
                Donate Now
              </Button>
              <Button variant="outline" class="w-full" size="lg" @click="showShareDialog = true">
                <Share2 class="w-4 h-4 mr-2" />
                Share Campaign
              </Button>
            </div>
          </div>
        </aside>
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
