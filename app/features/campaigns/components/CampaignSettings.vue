<script setup lang="ts">
import type { Campaign } from '../types'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { useCampaignBasicSettingsForm } from '../forms/campaign-basic-settings-form'
import { useCampaignStatsSettingsForm } from '../forms/campaign-stats-settings-form'
import { useCrowdfundingSettingsForm } from '../forms/crowdfunding-settings-form'
import { useCharityInfoForm } from '../forms/charity-info-form'
import { useSocialSharingForm } from '../forms/social-sharing-form'
import { useCampaigns } from '../composables/useCampaigns'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
}>()

const { updateCampaign } = useCampaigns()

// Local reactive state for each section
const basicData = ref({
  name: props.campaign.name,
  status: props.campaign.status
})

const statsData = ref({
  stats: {
    goalAmount: props.campaign.stats.goalAmount,
    includeGiftAidInGoal: props.campaign.stats.includeGiftAidInGoal
  }
})

const crowdfundingData = ref(props.campaign.crowdfunding)
const charityData = ref(props.campaign.charity)
const socialSharingData = ref(props.campaign.socialSharing)

// Form definitions
const basicForm = useCampaignBasicSettingsForm
const statsForm = useCampaignStatsSettingsForm
const crowdfundingForm = useCrowdfundingSettingsForm
const charityForm = useCharityInfoForm
const socialSharingForm = useSocialSharingForm

// Save state
const isSaving = ref(false)
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const hasChanges = computed(() => {
  return (
    basicData.value.name !== props.campaign.name ||
    basicData.value.status !== props.campaign.status ||
    JSON.stringify(crowdfundingData.value) !== JSON.stringify(props.campaign.crowdfunding) ||
    JSON.stringify(charityData.value) !== JSON.stringify(props.campaign.charity) ||
    JSON.stringify(socialSharingData.value) !== JSON.stringify(props.campaign.socialSharing)
  )
})

// Form refs for validation
const basicFormRef = ref()
const statsFormRef = ref()
const crowdfundingFormRef = ref()
const charityFormRef = ref()
const socialSharingFormRef = ref()

const saveChanges = async () => {
  // Validate all forms
  const forms = [
    basicFormRef.value,
    statsFormRef.value,
    crowdfundingFormRef.value,
    charityFormRef.value,
    socialSharingFormRef.value
  ]

  const allValid = forms.every((form) => form?.isValid)

  if (!allValid) {
    saveMessage.value = { type: 'error', text: 'Please fix all errors before saving' }
    setTimeout(() => (saveMessage.value = null), 5000)
    return
  }

  isSaving.value = true
  saveMessage.value = null

  try {
    await updateCampaign(props.campaign.id, {
      name: basicData.value.name,
      status: basicData.value.status,
      stats: {
        ...props.campaign.stats,
        goalAmount: statsData.value.stats.goalAmount,
        includeGiftAidInGoal: statsData.value.stats.includeGiftAidInGoal
      },
      crowdfunding: crowdfundingData.value,
      charity: charityData.value,
      socialSharing: socialSharingData.value
    })

    saveMessage.value = { type: 'success', text: 'Settings saved successfully' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } catch {
    saveMessage.value = { type: 'error', text: 'Failed to save settings. Please try again.' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Basic Settings -->
    <div class="config-section">
      <FormRenderer
        ref="basicFormRef"
        v-model="basicData"
        :section="basicForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Goal Settings -->
    <div class="config-section">
      <FormRenderer
        ref="statsFormRef"
        v-model="statsData"
        :section="statsForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Crowdfunding Settings -->
    <div class="config-section">
      <FormRenderer
        ref="crowdfundingFormRef"
        v-model="crowdfundingData"
        :section="crowdfundingForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Charity Info -->
    <div class="config-section">
      <FormRenderer
        ref="charityFormRef"
        v-model="charityData"
        :section="charityForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Social Sharing -->
    <div class="config-section">
      <FormRenderer
        ref="socialSharingFormRef"
        v-model="socialSharingData"
        :section="socialSharingForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Save Button -->
    <div
      class="sticky bottom-0 py-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t"
    >
      <Button
        :disabled="!hasChanges || isSaving"
        size="lg"
        class="w-full sm:w-auto"
        @click="saveChanges"
      >
        <Loader2 v-if="isSaving" class="w-4 h-4 mr-2 animate-spin" />
        <Save v-else class="w-4 h-4 mr-2" />
        {{ isSaving ? 'Saving...' : 'Save Changes' }}
      </Button>

      <!-- Save Message -->
      <div
        v-if="saveMessage"
        class="mt-4 p-3 rounded-md text-sm"
        :class="{
          'bg-green-50 text-green-800 border border-green-200': saveMessage.type === 'success',
          'bg-red-50 text-red-800 border border-red-200': saveMessage.type === 'error'
        }"
      >
        {{ saveMessage.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border;
}
</style>
