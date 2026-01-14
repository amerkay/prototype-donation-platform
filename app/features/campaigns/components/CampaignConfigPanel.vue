<script setup lang="ts">
import { useCampaignConfigStore } from '~/stores/campaignConfig'
import { useCampaigns } from '../composables/useCampaigns'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { useCampaignBasicSettingsForm } from '../forms/campaign-basic-settings-form'
import { useCampaignStatsSettingsForm } from '../forms/campaign-stats-settings-form'
import { useCrowdfundingSettingsForm } from '../forms/crowdfunding-settings-form'
import { Button } from '@/components/ui/button'
import { Save, Loader2, RotateCcw } from 'lucide-vue-next'

const store = useCampaignConfigStore()
const { updateCampaign } = useCampaigns()

// Form definitions
const basicForm = useCampaignBasicSettingsForm
const statsForm = useCampaignStatsSettingsForm
const crowdfundingForm = useCrowdfundingSettingsForm

// Local reactive state for forms (bound to store)
const basicData = computed({
  get: () => ({
    name: store.name,
    status: store.status
  }),
  set: (val) => {
    store.name = val.name
    store.status = val.status
    store.markDirty()
  }
})

const statsData = computed({
  get: () => ({
    stats: {
      goalAmount: store.stats?.goalAmount
    }
  }),
  set: (val) => {
    store.updateGoal(val.stats.goalAmount)
  }
})

const crowdfundingData = computed({
  get: () => store.crowdfunding,
  set: (val) => {
    if (val) {
      store.crowdfunding = val
      store.markDirty()
    }
  }
})

// Form refs for validation
const basicFormRef = ref()
const statsFormRef = ref()
const crowdfundingFormRef = ref()

// Save state
const saveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const saveChanges = async () => {
  // Validate all forms
  const forms = [basicFormRef.value, statsFormRef.value, crowdfundingFormRef.value]

  const allValid = forms.every((form) => form?.isValid)

  if (!allValid) {
    saveMessage.value = { type: 'error', text: 'Please fix all errors before saving' }
    setTimeout(() => (saveMessage.value = null), 5000)
    return
  }

  if (!store.id) return

  store.isSaving = true
  saveMessage.value = null

  try {
    await updateCampaign(store.id, {
      name: store.name,
      status: store.status,
      stats: store.stats!,
      crowdfunding: store.crowdfunding!,
      peerToPeer: store.peerToPeer!,
      socialSharing: store.socialSharing!
    })

    store.markClean()
    saveMessage.value = { type: 'success', text: 'Settings saved successfully' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } catch {
    saveMessage.value = { type: 'error', text: 'Failed to save settings. Please try again.' }
    setTimeout(() => (saveMessage.value = null), 5000)
  } finally {
    store.isSaving = false
  }
}

// Emit for parent to handle discard
const emit = defineEmits<{
  discard: []
}>()

const discardChanges = () => {
  emit('discard')
}
</script>

<template>
  <div class="space-y-4">
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

    <!-- Crowdfunding Page Settings -->
    <div v-if="crowdfundingData" class="config-section space-y-4">
      <FormRenderer
        ref="crowdfundingFormRef"
        v-model="crowdfundingData"
        :section="crowdfundingForm"
        validate-on-mount
        update-only-when-valid
      />
    </div>

    <!-- Save Button -->
    <div
      class="sticky bottom-0 py-4 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-t -mx-4 px-4"
    >
      <div class="flex gap-2">
        <Button
          :disabled="!store.isDirty || store.isSaving"
          size="lg"
          class="flex-1"
          @click="saveChanges"
        >
          <Loader2 v-if="store.isSaving" class="w-4 h-4 mr-2 animate-spin" />
          <Save v-else class="w-4 h-4 mr-2" />
          {{ store.isSaving ? 'Saving...' : 'Save Changes' }}
        </Button>
        <Button
          v-if="store.isDirty"
          variant="outline"
          size="lg"
          :disabled="store.isSaving"
          @click="discardChanges"
        >
          <RotateCcw class="w-4 h-4 mr-2" />
          Discard
        </Button>
      </div>

      <!-- Save Message -->
      <div
        v-if="saveMessage"
        class="mt-3 p-3 rounded-md text-sm"
        :class="{
          'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800':
            saveMessage.type === 'success',
          'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800':
            saveMessage.type === 'error'
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
  @apply px-4 py-5 sm:px-5 bg-muted/50 rounded-xl border;
}
</style>
