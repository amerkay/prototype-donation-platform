<script setup lang="ts">
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import {
  getCampaignTypeShortLabel,
  getCampaignTypeBadgeVariant
} from '~/features/campaigns/shared/composables/useCampaignTypes'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import type { Campaign, CampaignForm } from '~/features/campaigns/shared/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ICON_FORM } from '~/lib/icons'

interface Props {
  open: boolean
  currentCampaignId: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'select', form: CampaignForm, sourceCampaignId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { campaigns } = useCampaigns()
const store = useCampaignConfigStore()

// Filter: same form type (donation/registration), exclude current, exclude fundraisers, must have a form
const currentFormType = computed(() => getCampaignCapabilities(store.type).formType)

const availableCampaigns = computed(() => {
  return campaigns.value.filter((c) => {
    if (c.id === props.currentCampaignId) return false
    if (c.type === 'p2p-fundraiser') return false
    if (!c.form) return false
    // Same form type only (donation ↔ donation, registration ↔ registration)
    return getCampaignCapabilities(c.type).formType === currentFormType.value
  })
})

const handleSelect = (campaign: Campaign) => {
  if (!campaign.form) return
  emit('select', campaign.form, campaign.id)
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="props.open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <DialogTitle>Copy Form from Campaign</DialogTitle>
        <DialogDescription>
          Select a campaign to copy its form configuration and products.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="max-h-[60vh]">
        <div v-if="availableCampaigns.length === 0" class="py-8 text-center text-muted-foreground">
          No campaigns with compatible forms found.
        </div>

        <div v-else class="space-y-1">
          <Button
            v-for="campaign in availableCampaigns"
            :key="campaign.id"
            variant="ghost"
            class="w-full justify-start h-auto py-3 px-3"
            @click="handleSelect(campaign)"
          >
            <div class="flex items-center gap-3 w-full">
              <ICON_FORM class="w-4 h-4 text-muted-foreground shrink-0" />
              <div class="flex-1 text-left min-w-0">
                <div class="font-medium text-sm truncate">{{ campaign.name }}</div>
                <div class="text-xs text-muted-foreground truncate">
                  {{ campaign.form?.name }}
                </div>
              </div>
              <Badge :variant="getCampaignTypeBadgeVariant(campaign.type)" class="text-xs shrink-0">
                {{ getCampaignTypeShortLabel(campaign) }}
              </Badge>
            </div>
          </Button>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
