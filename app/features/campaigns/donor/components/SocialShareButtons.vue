<script setup lang="ts">
import type { SocialSharingSettings } from '~/features/settings/admin/stores/socialSharingSettings'
import { Button } from '@/components/ui/button'
import {
  ICON_SOCIAL_FACEBOOK,
  ICON_SOCIAL_TWITTER,
  ICON_SOCIAL_LINKEDIN,
  ICON_EMAIL,
  ICON_SOCIAL_COPY_LINK,
  ICON_SOCIAL_WHATSAPP
} from '~/lib/icons'

type ShareSettings = SocialSharingSettings & { copyLink?: boolean }

const props = withDefaults(
  defineProps<{
    settings: ShareSettings | null
    campaignUrl: string
    campaignTitle: string
    shortDescription?: string
    size?: 'default' | 'sm' | 'lg' | 'icon'
    variant?: 'default' | 'outline' | 'ghost'
    showLabels?: boolean
  }>(),
  {
    size: 'default',
    variant: 'outline',
    showLabels: false
  }
)

const emit = defineEmits<{
  share: [platform: string]
}>()

// Social platform configuration
const socialPlatforms = [
  { key: 'facebook', label: 'Facebook', icon: ICON_SOCIAL_FACEBOOK },
  { key: 'twitter', label: 'Twitter / X', icon: ICON_SOCIAL_TWITTER },
  { key: 'linkedin', label: 'LinkedIn', icon: ICON_SOCIAL_LINKEDIN },
  { key: 'whatsapp', label: 'WhatsApp', icon: ICON_SOCIAL_WHATSAPP },
  { key: 'email', label: 'Email', icon: ICON_EMAIL },
  { key: 'copyLink', label: 'Copy Link', icon: ICON_SOCIAL_COPY_LINK }
] as const

// Get enabled platforms from settings
const enabledPlatforms = computed(() => {
  if (!props.settings) return []
  return socialPlatforms.filter((p) => props.settings?.[p.key as keyof ShareSettings])
})

// Get share URL for platform
const getShareUrl = (platform: string) => {
  const url = encodeURIComponent(props.campaignUrl)
  const title = encodeURIComponent(props.campaignTitle)
  const description = encodeURIComponent(props.shortDescription || '')

  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${url}`
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${url}&text=${title}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    case 'whatsapp':
      return `https://wa.me/?text=${title}%20${url}`
    case 'email':
      return `mailto:?subject=${title}&body=${description}%0A%0A${url}`
    default:
      return props.campaignUrl
  }
}

const handleShare = (platform: string) => {
  const url = getShareUrl(platform)
  if (platform === 'email') {
    window.location.href = url
  } else if (platform === 'copyLink') {
    // Emit event for parent to handle (e.g., open share dialog)
    emit('share', platform)
  } else {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400')
  }
  emit('share', platform)
}
</script>

<template>
  <template v-if="enabledPlatforms.length > 0">
    <Button
      v-for="platform in enabledPlatforms"
      :key="platform.key"
      :variant="variant"
      :size="size"
      :class="{ 'justify-start': showLabels }"
      :title="platform.label"
      @click="handleShare(platform.key)"
    >
      <component :is="platform.icon" :class="showLabels ? 'w-4 h-4 mr-2' : 'w-4 h-4'" />
      <template v-if="showLabels">
        {{ platform.label }}
      </template>
    </Button>
  </template>
</template>
