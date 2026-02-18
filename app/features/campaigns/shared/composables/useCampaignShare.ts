import { computed, toValue, type MaybeRef } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useSocialSharingSettingsStore } from '~/features/settings/admin/stores/socialSharingSettings'

/**
 * Composable for campaign sharing functionality
 * Provides URL generation, clipboard operations, and sharing config checks
 *
 * @param campaignSlug - Optional campaign slug. If not provided, uses admin store's campaign ID
 */
export function useCampaignShare(campaignSlug?: MaybeRef<string | null | undefined>) {
  const store = useCampaignConfigStore()
  const {
    public: { siteUrl }
  } = useRuntimeConfig()
  const charityStore = useCharitySettingsStore()
  const orgSharing = useSocialSharingSettingsStore()

  // Generate campaign URL
  const campaignUrl = computed(() => {
    const slug = campaignSlug ? toValue(campaignSlug) : store.id
    if (!slug) return ''
    return `${siteUrl}/${charityStore.slug}/${slug}`
  })

  // Clipboard functionality
  const { copy, copied } = useClipboard({ source: campaignUrl })

  // Check if non-copyLink platforms are enabled (org-level)
  const hasOtherPlatforms = computed(() => {
    return (
      orgSharing.facebook ||
      orgSharing.twitter ||
      orgSharing.linkedin ||
      orgSharing.whatsapp ||
      orgSharing.email
    )
  })

  // Count enabled platforms (org-level)
  const enabledPlatformsCount = computed(() => {
    return [
      orgSharing.facebook,
      orgSharing.twitter,
      orgSharing.linkedin,
      orgSharing.whatsapp,
      orgSharing.email
    ].filter(Boolean).length
  })

  return {
    store,
    campaignUrl,
    copy,
    copied,
    hasOtherPlatforms,
    enabledPlatformsCount
  }
}
