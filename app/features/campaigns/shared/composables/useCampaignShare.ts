import { computed, toValue, type MaybeRef } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'

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

  // Generate campaign URL
  const campaignUrl = computed(() => {
    const slug = campaignSlug ? toValue(campaignSlug) : store.id
    if (!slug) return ''
    return `${siteUrl}/${charityStore.slug}/${slug}`
  })

  // Clipboard functionality
  const { copy, copied } = useClipboard({ source: campaignUrl })

  // Check if non-copyLink platforms are enabled
  const hasOtherPlatforms = computed(() => {
    if (!store.socialSharing) return false
    return (
      store.socialSharing.facebook ||
      store.socialSharing.twitter ||
      store.socialSharing.linkedin ||
      store.socialSharing.whatsapp ||
      store.socialSharing.email
    )
  })

  // Count enabled platforms
  const enabledPlatformsCount = computed(() => {
    if (!store.socialSharing) return 0
    return Object.values(store.socialSharing).filter(Boolean).length
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
