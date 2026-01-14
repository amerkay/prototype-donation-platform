<script setup lang="ts">
import { useCampaignConfigStore } from '~/stores/campaignConfig'
import SocialShareButtons from './SocialShareButtons.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2,
  Copy,
  Check,
  MessageCircle,
  Share2
} from 'lucide-vue-next'
import { useClipboard } from '@vueuse/core'

const store = useCampaignConfigStore()

// Debug: Log socialSharing state
watch(
  () => store.socialSharing,
  (newVal) => {
    console.log('SharingTab - socialSharing changed:', newVal)
  },
  { immediate: true, deep: true }
)

// Share URLs
const campaignUrl = computed(() => `https://donate.example.com/campaigns/${store.id}`)
const { copy, copied } = useClipboard({ source: campaignUrl })

// Social platform config (consistent styling)
const socialPlatforms = [
  { key: 'facebook' as const, label: 'Facebook', icon: Facebook },
  { key: 'twitter' as const, label: 'Twitter / X', icon: Twitter },
  { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
  { key: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
  { key: 'email' as const, label: 'Email', icon: Mail },
  { key: 'copyLink' as const, label: 'Copy Link', icon: Link2 }
]

// Toggle social platform - must update store reactively
const togglePlatform = (
  key: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copyLink',
  enabled: boolean
) => {
  if (store.socialSharing) {
    // Create a new object to trigger reactivity
    const updated = { ...store.socialSharing }
    updated[key] = enabled
    store.socialSharing = updated
    store.markDirty()
  }
}

// Count enabled platforms
const enabledCount = computed(() => {
  if (!store.socialSharing) return 0
  return Object.values(store.socialSharing).filter(Boolean).length
})
</script>

<template>
  <div class="space-y-6">
    <!-- Share Link Card -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Link2 class="w-5 h-5" />
          Campaign Link
        </CardTitle>
        <CardDescription> Share this link to direct people to your campaign </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex gap-2">
          <Input :model-value="campaignUrl" readonly class="font-mono text-sm" />
          <Button @click="copy()">
            <Check v-if="copied" class="w-4 h-4 mr-2" />
            <Copy v-else class="w-4 h-4 mr-2" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </Button>
        </div>

        <!-- Quick Share Preview -->
        <div class="p-4 rounded-lg border bg-muted/30">
          <div class="flex items-start gap-4">
            <div
              v-if="store.crowdfunding?.coverPhoto"
              class="w-24 h-16 rounded-md overflow-hidden shrink-0"
            >
              <img
                :src="store.crowdfunding.coverPhoto"
                :alt="store.crowdfunding.title"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="min-w-0">
              <p class="font-medium truncate">{{ store.crowdfunding?.title || store.name }}</p>
              <p class="text-sm text-muted-foreground line-clamp-2">
                {{ store.crowdfunding?.shortDescription }}
              </p>
              <p class="text-xs text-primary mt-1">{{ campaignUrl }}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Social Platforms Card -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle class="flex items-center gap-2">
              <Share2 class="w-5 h-5" />
              Social Sharing
            </CardTitle>
            <CardDescription>
              Enable sharing buttons on your campaign page ({{ enabledCount }} enabled)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="platform in socialPlatforms"
            :key="platform.key"
            class="flex items-center justify-between p-3 rounded-lg border transition-colors"
            :class="store.socialSharing?.[platform.key] ? 'bg-primary/5' : 'bg-muted/30'"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="store.socialSharing?.[platform.key] ? 'bg-primary/10' : 'bg-muted'"
              >
                <component
                  :is="platform.icon"
                  class="w-5 h-5"
                  :class="
                    store.socialSharing?.[platform.key] ? 'text-primary' : 'text-muted-foreground'
                  "
                />
              </div>
              <Label class="cursor-pointer">{{ platform.label }}</Label>
            </div>
            <Switch
              :model-value="!!store.socialSharing?.[platform.key]"
              @update:model-value="(val: boolean) => togglePlatform(platform.key, val)"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Preview Share Buttons -->
    <Card>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
        <CardDescription>
          This is how the share buttons will appear on your campaign page
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="p-6 rounded-lg border bg-muted/30 flex flex-col items-center gap-4">
          <p class="text-sm text-muted-foreground">Share this campaign</p>
          <div class="flex gap-2 flex-wrap justify-center">
            <SocialShareButtons
              v-if="store.socialSharing"
              :settings="store.socialSharing"
              :campaign-id="store.id!"
              :campaign-title="store.crowdfunding?.title || store.name"
              :short-description="store.crowdfunding?.shortDescription"
              size="icon"
            />
          </div>
          <p v-if="enabledCount === 0" class="text-sm text-muted-foreground">
            Enable at least one platform to see the preview
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
