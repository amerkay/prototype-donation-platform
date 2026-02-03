<script setup lang="ts">
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { getCampaignTypeShortLabel } from '~/features/campaigns/shared/composables/useCampaignTypes'
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
import { ArrowLeft, FileText, Check } from 'lucide-vue-next'

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

// Two-step selection: campaign → form
const selectedCampaign = ref<Campaign | null>(null)

// Get campaigns with forms (excluding current campaign)
const availableCampaigns = computed(() => {
  return campaigns.value.filter((c) => {
    if (c.id === props.currentCampaignId) return false
    const { forms } = useForms(c.id)
    return forms.value.length > 0
  })
})

// Get forms from selected campaign
const selectedCampaignForms = computed(() => {
  if (!selectedCampaign.value) return []
  const { forms } = useForms(selectedCampaign.value.id)
  return forms.value
})

const handleCampaignSelect = (campaign: Campaign) => {
  selectedCampaign.value = campaign
}

const handleFormSelect = (form: CampaignForm) => {
  if (!selectedCampaign.value) return
  emit('select', form, selectedCampaign.value.id)
  emit('update:open', false)
  // Reset state for next time
  selectedCampaign.value = null
}

const handleBack = () => {
  selectedCampaign.value = null
}

const handleOpenChange = (open: boolean) => {
  emit('update:open', open)
  if (!open) {
    selectedCampaign.value = null
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          <div class="flex items-center gap-2">
            <Button
              v-if="selectedCampaign"
              variant="ghost"
              size="icon"
              class="h-6 w-6 -ml-1"
              @click="handleBack"
            >
              <ArrowLeft class="h-4 w-4" />
            </Button>
            <span>{{ selectedCampaign ? 'Select Form' : 'Select Campaign' }}</span>
          </div>
        </DialogTitle>
        <DialogDescription>
          {{
            selectedCampaign
              ? `Copy a form from "${selectedCampaign.name}"`
              : 'Choose a campaign to copy a form from'
          }}
        </DialogDescription>
      </DialogHeader>

      <!-- Step 1: Campaign Selection -->
      <ScrollArea v-if="!selectedCampaign" class="h-[400px] pr-4">
        <div v-if="availableCampaigns.length === 0" class="text-center py-12 text-muted-foreground">
          <FileText class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-sm">No other campaigns with forms found</p>
        </div>
        <div v-else class="grid gap-3">
          <button
            v-for="campaign in availableCampaigns"
            :key="campaign.id"
            class="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="handleCampaignSelect(campaign)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-medium truncate">{{ campaign.name }}</p>
                <Badge variant="outline" class="text-xs shrink-0">
                  {{ getCampaignTypeShortLabel(campaign) }}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ useForms(campaign.id).forms.value.length }} form{{
                  useForms(campaign.id).forms.value.length !== 1 ? 's' : ''
                }}
              </p>
            </div>
          </button>
        </div>
      </ScrollArea>

      <!-- Step 2: Form Selection -->
      <ScrollArea v-else class="h-[400px] pr-4">
        <div
          v-if="selectedCampaignForms.length === 0"
          class="text-center py-12 text-muted-foreground"
        >
          <FileText class="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p class="text-sm">No forms found in this campaign</p>
        </div>
        <div v-else class="grid gap-3">
          <button
            v-for="form in selectedCampaignForms"
            :key="form.id"
            class="flex items-center justify-between gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            @click="handleFormSelect(form)"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <FileText class="w-4 h-4 text-muted-foreground shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ form.name }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Badge v-if="form.isDefault" variant="default" class="text-xs gap-1">
                    <Check class="w-3 h-3" />
                    Default
                  </Badge>
                </div>
              </div>
            </div>
          </button>
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>
