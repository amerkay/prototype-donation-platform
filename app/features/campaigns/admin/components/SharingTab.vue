<script setup lang="ts">
import { useCampaignShare } from '~/features/campaigns/shared/composables/useCampaignShare'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Facebook, Twitter, Linkedin, Mail, Link2, MessageCircle, Share2 } from 'lucide-vue-next'

const { store, enabledPlatformsCount: enabledCount } = useCampaignShare()

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
</script>

<template>
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
</template>
