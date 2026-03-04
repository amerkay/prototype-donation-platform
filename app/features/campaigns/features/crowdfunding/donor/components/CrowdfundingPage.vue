<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import type { SocialSharingSettings } from '~/features/settings/admin/stores/socialSharingSettings'
import {
  useBrandingCssVars,
  BRANDING_STYLE_KEY
} from '~/features/settings/admin/composables/useBrandingCssVars'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'
import { useCampaignShare } from '~/features/campaigns/features/sharing/shared/composables/useCampaignShare'
import ShareDialog from '~/features/campaigns/features/sharing/donor/components/ShareDialog.vue'
import DonateDialog from '~/features/campaigns/donor/components/DonateDialog.vue'
import CampaignProgress from './CampaignProgress.vue'
import CampaignActions from './CampaignActions.vue'
import CampaignStorySection from './CampaignStorySection.vue'
import CharityInfoCard from './CharityInfoCard.vue'
import DonationsPanel from './DonationsPanel.vue'
import CampaignShareSection from './CampaignShareSection.vue'
import { Separator } from '@/components/ui/separator'
import { ICON_DONATION } from '~/lib/icons'
import { CAMPAIGN_FIELD_TARGETS as CT } from '~/features/campaigns/admin/forms/campaign-config-master'

const props = defineProps<{
  campaign: Campaign
  currency?: string
  /** Charity field targets for click-to-edit in admin preview context */
  targets?: Record<string, string>
}>()

// Provide branding to teleported modals (ShareDialog, DonateDialog)
const { brandingStyle } = useBrandingCssVars()
provide(BRANDING_STYLE_KEY, brandingStyle)

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

// Get limited donations for display
const displayedDonations = computed(() => {
  const limit = props.campaign.crowdfunding?.numberOfDonationsToShow || 5
  return props.campaign.recentDonations.slice(0, limit)
})

const totalDonations = computed(() => props.campaign.stats?.totalDonations ?? 0)

const handleSocialShare = (platform: string) => {
  if (platform === 'copyLink') {
    showShareDialog.value = true
  }
}

const hasImage = computed(() => !!props.campaign.crowdfunding?.coverPhoto)

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
      <!-- ============================================================
           WITH COVER PHOTO: true two-column layout on desktop
           Left col:  image (top) + story + charity
           Right col: campaign info + donations
           Mobile DOM order: mobile-image → info → donations → story → charity → social
           ============================================================ -->
      <template v-if="hasImage">
        <!-- Mobile-only image (hidden on desktop — desktop image lives inside the left column) -->
        <div
          :data-field="CT.crowdfunding.coverPhoto"
          class="relative aspect-video @3xl:hidden bg-muted overflow-hidden"
        >
          <img
            :src="campaign.crowdfunding.coverPhoto"
            :alt="campaign.crowdfunding.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Desktop two-column flex -->
        <div class="@3xl:flex @3xl:items-start">
          <!-- ── Right column (DOM first → mobile renders it right after the mobile image) ── -->
          <div class="@3xl:order-2 @3xl:w-2/5 @3xl:flex @3xl:flex-col">
            <!-- Campaign info -->
            <div class="px-4 pt-4 pb-3 space-y-3 @3xl:p-8 @3xl:space-y-4">
              <h2
                :data-field="CT.crowdfunding.title"
                class="text-xl @3xl:text-2xl font-bold leading-tight"
              >
                {{ campaign.crowdfunding.title }}
              </h2>
              <p
                :data-field="CT.crowdfunding.shortDescription"
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
                :data-field="CT.crowdfunding.goalAmount"
                :stats="campaign.stats"
                :goal-amount="campaign.crowdfunding.goalAmount"
                :end-date="campaign.crowdfunding.endDate"
                :matched-giving="campaign.matchedGiving"
                :campaign-status="campaign.status"
              />
              <CampaignActions
                :show-share="hasSocialSharing"
                @donate="showDonateDialog = true"
                @share="showShareDialog = true"
              />
            </div>

            <!-- Donations -->
            <div
              v-if="campaign.crowdfunding.showRecentDonations"
              class="px-4 pb-4 @3xl:px-8 @3xl:pb-8"
              :data-field="CT.crowdfunding.showRecentDonations"
            >
              <Separator class="@3xl:hidden my-3" />
              <DonationsPanel
                :donations="displayedDonations"
                :total-count="totalDonations"
                :default-view="campaign.crowdfunding.defaultDonationsView"
                :campaign-currency="campaign.crowdfunding?.currency"
              />
            </div>
          </div>

          <!-- ── Left column (DOM second, visually first on desktop) ── -->
          <div class="@3xl:order-1 @3xl:flex-1 @3xl:flex @3xl:flex-col">
            <!-- Desktop-only image (hidden on mobile — mobile uses the image above) -->
            <div
              :data-field="CT.crowdfunding.coverPhoto"
              class="hidden @3xl:flex @3xl:flex-1 bg-muted overflow-hidden"
            >
              <img
                :src="campaign.crowdfunding.coverPhoto"
                :alt="campaign.crowdfunding.title"
                class="w-full object-cover @3xl:min-h-80"
              />
            </div>

            <!-- Story -->
            <div
              v-if="campaign.crowdfunding.story"
              :data-field="CT.crowdfunding.story"
              class="px-4 pb-4 @3xl:px-8 @3xl:py-6 space-y-3"
            >
              <Separator class="@3xl:hidden my-3" />
              <CampaignStorySection :story="campaign.crowdfunding.story" />
            </div>

            <!-- About the Charity -->
            <div class="px-4 pb-4 @3xl:px-8 @3xl:pb-8">
              <Separator class="@3xl:hidden my-3" />
              <CharityInfoCard :targets="targets" />
            </div>
          </div>
        </div>

        <!-- Social Sharing — full width below both columns -->
        <div
          v-if="hasSocialSharing"
          class="space-y-3 px-4 pb-4 @3xl:px-8 @3xl:pb-8 @3xl:pt-4"
          :data-field="CT.crowdfunding.enableSocialSharing"
        >
          <Separator class="@3xl:hidden my-3" />
          <CampaignShareSection
            :settings="effectiveSharing"
            :campaign-url="campaignUrl"
            :campaign-title="campaign.crowdfunding?.title || campaign.name"
            :short-description="campaign.crowdfunding?.shortDescription"
            @share="handleSocialShare"
          />
        </div>
      </template>

      <!-- ============================================================
           WITHOUT COVER PHOTO: centered constrained layout on desktop
           Hero: title+desc left, progress+actions right
           Main: story+charity left, donations right
           ============================================================ -->
      <template v-else>
        <div class="@3xl:max-w-4xl @3xl:mx-auto">
          <!-- Hero Section: title, description, progress, actions -->
          <div class="px-4 pt-4 pb-3 space-y-3 @3xl:p-8 @3xl:space-y-4">
            <div class="space-y-3 @3xl:flex @3xl:gap-8 @3xl:items-start @3xl:space-y-0">
              <!-- Left: title + description -->
              <div class="space-y-3 @3xl:flex-1">
                <h2
                  :data-field="CT.crowdfunding.title"
                  class="text-xl @3xl:text-2xl font-bold leading-tight"
                >
                  {{ campaign.crowdfunding.title }}
                </h2>
                <p
                  :data-field="CT.crowdfunding.shortDescription"
                  class="text-sm @3xl:text-base text-muted-foreground leading-relaxed"
                >
                  {{ campaign.crowdfunding.shortDescription }}
                </p>
              </div>

              <!-- Right: progress + actions -->
              <div class="space-y-3 @3xl:w-2/5 @3xl:shrink-0">
                <CampaignProgress
                  v-if="
                    campaign.crowdfunding.showProgressBar &&
                    campaign.crowdfunding.goalAmount &&
                    campaign.stats
                  "
                  :data-field="CT.crowdfunding.goalAmount"
                  :stats="campaign.stats"
                  :goal-amount="campaign.crowdfunding.goalAmount"
                  :end-date="campaign.crowdfunding.endDate"
                  :matched-giving="campaign.matchedGiving"
                  :campaign-status="campaign.status"
                />
                <CampaignActions
                  :show-share="hasSocialSharing"
                  @donate="showDonateDialog = true"
                  @share="showShareDialog = true"
                />
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="px-4 pb-4 @3xl:p-8 @3xl:pt-0">
            <Separator class="@3xl:hidden my-3" />

            <!-- Two-column layout for desktop -->
            <div class="@3xl:flex @3xl:gap-8">
              <!-- Left Column: Story + mobile Donations + Charity -->
              <div class="flex-1 space-y-4">
                <div
                  v-if="campaign.crowdfunding.story"
                  :data-field="CT.crowdfunding.story"
                  class="space-y-3"
                >
                  <CampaignStorySection :story="campaign.crowdfunding.story" />
                </div>

                <Separator v-if="campaign.crowdfunding.story" class="@3xl:hidden" />

                <!-- Recent Donations: mobile/tablet only -->
                <div
                  v-if="campaign.crowdfunding.showRecentDonations"
                  class="@3xl:hidden"
                  :data-field="CT.crowdfunding.showRecentDonations"
                >
                  <DonationsPanel
                    :donations="displayedDonations"
                    :total-count="totalDonations"
                    :default-view="campaign.crowdfunding.defaultDonationsView"
                    :campaign-currency="campaign.crowdfunding?.currency"
                    compact
                  />
                </div>

                <Separator v-if="campaign.crowdfunding.showRecentDonations" class="@3xl:hidden" />

                <CharityInfoCard :targets="targets" />
              </div>

              <!-- Right Column: Recent Donations (desktop only) -->
              <aside
                v-if="campaign.crowdfunding.showRecentDonations"
                class="hidden @3xl:block @3xl:w-2/5 shrink-0"
                :data-field="CT.crowdfunding.showRecentDonations"
              >
                <div class="sticky top-6">
                  <DonationsPanel
                    :donations="displayedDonations"
                    :total-count="totalDonations"
                    :default-view="campaign.crowdfunding.defaultDonationsView"
                  />
                </div>
              </aside>
            </div>

            <!-- Social Sharing — full width, outside two-column layout -->
            <div
              v-if="hasSocialSharing"
              class="space-y-3 pt-4 pb-4 @3xl:pt-6 @3xl:pb-0"
              :data-field="CT.crowdfunding.enableSocialSharing"
            >
              <CampaignShareSection
                :settings="effectiveSharing"
                :campaign-url="campaignUrl"
                :campaign-title="campaign.crowdfunding?.title || campaign.name"
                :short-description="campaign.crowdfunding?.shortDescription"
                @share="handleSocialShare"
              />
            </div>
          </div>
        </div>
      </template>

      <!-- Dialogs -->
      <ShareDialog v-model:open="showShareDialog" :campaign="campaign" />
      <DonateDialog v-model:open="showDonateDialog" :campaign-id="campaign.id!" />
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="bg-muted/50 rounded-xl border p-8 text-center">
    <ICON_DONATION class="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
    <p class="text-muted-foreground">No campaign data loaded</p>
  </div>
</template>
