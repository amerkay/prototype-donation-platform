import { computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useCampaignConfigStore } from '~/stores/campaignConfig'

/**
 * Composable for campaign sharing functionality
 * Provides URL generation, clipboard operations, and sharing config checks
 */
export function useCampaignShare() {
  const store = useCampaignConfigStore()

  // Generate campaign URL
  const campaignUrl = computed(() => `https://donate.example.com/campaigns/${store.id}`)

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
