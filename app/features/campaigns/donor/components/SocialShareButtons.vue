<script setup lang="ts">
import type { SocialSharingSettings } from '~/features/campaigns/shared/types'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    settings: SocialSharingSettings | null
    campaignId: string
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
  { key: 'facebook', label: 'Facebook', icon: Facebook },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter },
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'copyLink', label: 'Copy Link', icon: Link2 }
] as const

// Get enabled platforms from settings
const enabledPlatforms = computed(() => {
  if (!props.settings) return []
  return socialPlatforms.filter((p) => props.settings?.[p.key as keyof SocialSharingSettings])
})

// Get share URL for platform
const getShareUrl = (platform: string) => {
  const campaignUrl = `https://donate.example.com/campaigns/${props.campaignId}`
  const url = encodeURIComponent(campaignUrl)
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
      return campaignUrl
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
