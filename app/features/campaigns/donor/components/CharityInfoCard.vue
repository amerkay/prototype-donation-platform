<script setup lang="ts">
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ICON_EXTERNAL_LINK } from '~/lib/icons'

defineProps<{
  /** Charity field targets for click-to-edit in admin preview context */
  targets?: Record<string, string>
}>()

const charityStore = useCharitySettingsStore()
const charityInfo = computed(() => ({
  name: charityStore.name,
  registrationNumber: charityStore.registrationNumber,
  website: charityStore.website,
  description: charityStore.description,
  address: charityStore.formattedAddress
}))
</script>

<template>
  <Card data-field="crowdfunding.charityNotice" class="gap-2">
    <CardHeader class="pb-0 px-5">
      <h3 class="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
        About the Charity
      </h3>
    </CardHeader>
    <CardContent class="px-5 space-y-2">
      <div
        :data-field="
          [targets?.charityName, targets?.phone, targets?.email].filter(Boolean).join(',') ||
          undefined
        "
      >
        <h4 class="font-semibold text-sm">{{ charityInfo.name }}</h4>
        <p class="text-xs text-muted-foreground">
          Registered Charity: {{ charityInfo.registrationNumber }}
        </p>
      </div>
      <p
        v-if="charityInfo.address"
        class="text-xs text-muted-foreground"
        :data-field="targets?.charityAddress"
      >
        {{ charityInfo.address }}
      </p>
      <p class="text-sm text-muted-foreground line-clamp-3" :data-field="targets?.description">
        {{ charityInfo.description }}
      </p>
      <a
        v-if="charityInfo.website"
        :href="charityInfo.website"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        :data-field="targets?.website"
      >
        {{ charityInfo.website.replace(/^https?:\/\//, '') }}
        <ICON_EXTERNAL_LINK class="w-3 h-3" />
      </a>
    </CardContent>
  </Card>
</template>
