<script setup lang="ts">
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import CampaignHeader from '~/features/campaigns/admin/components/CampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CrowdfundingPagePreview from '~/features/campaigns/features/crowdfunding/admin/components/CrowdfundingPagePreview.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ICON_HIDE } from '~/lib/icons'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { Campaign, CampaignStatus } from '~/features/campaigns/shared/types'
import { ACTIVE_CONFIG_TAB_KEY } from '~/features/campaigns/admin/composables/useActiveConfigTab'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useEditState } from '~/features/_shared/composables/useEditState'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { getCampaignById, updateCampaign } = useCampaigns()
const charityStore = useCharitySettingsStore()
const store = useCampaignConfigStore()

// Get campaign data (fundraisers auto-merge parent template fields via getCampaignById)
const campaign = computed(() => getCampaignById(route.params.id as string))

// Initialize store synchronously — formConfig is auto-populated from campaign.form
if (campaign.value) {
  store.initialize(campaign.value)
}

onMounted(() => {
  if (!campaign.value) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }
})

onUnmounted(() => {
  // cleanup if needed
})

// Watch for campaign ID changes (navigation between campaigns)
watch(
  () => route.params.id,
  (newId) => {
    const newCampaign = getCampaignById(newId as string)
    if (newCampaign) {
      store.initialize(newCampaign)
    }
  }
)

// originalData must read from STORE (current state), not API data
const campaignForStore = computed(() => store.fullCampaign)

// Form ref for validation
const formRef = ref()

const isTerminal = computed(() => store.status === 'completed' || store.status === 'ended')
const editableMode = ref(!isTerminal.value)
const crowdfundingEnabled = computed(() => store.crowdfunding?.enabled !== false)
const { brandingStyle } = useBrandingCssVars()

// Preview switching — provide active tab ref for config panel to write to
const activeConfigTab = ref(store.isFundraiser ? 'crowdfunding' : 'donationForm')
provide(ACTIVE_CONFIG_TAB_KEY, activeConfigTab)
const isFormTabActive = computed(() => activeConfigTab.value === 'donationForm')

// Single store — no additionalStores needed
const {
  handleSave: handleCampaignSave,
  handleDiscard: handleCampaignDiscard,
  confirmDiscard,
  showDiscardDialog,
  patchBaseline
} = useEditState({
  store,
  formRef,
  originalData: campaignForStore,
  onSave: async () => {
    if (!store.id) return
    await updateCampaign(store.id, {
      name: store.name,
      status: store.status,
      stats: store.stats!,
      crowdfunding: store.crowdfunding!,
      peerToPeer: store.peerToPeer!,
      matchedGiving: store.matchedGiving,
      form: store.assembledForm ?? store.form
    })
  }
})

function handleSave() {
  handleCampaignSave()
}

function handleDiscard() {
  handleCampaignDiscard()
}

// Breadcrumbs — portal context
const breadcrumbs = computed(() => [
  { label: 'Portal', href: '/portal' },
  { label: 'Fundraisers', href: '/portal/fundraisers' },
  { label: store.name }
])

// Save name/status independently (no form validation required)
async function saveCampaignMeta(updates: Partial<Pick<Campaign, 'name' | 'status'>>) {
  if (!store.id) return
  try {
    await updateCampaign(store.id, updates)
    patchBaseline(updates)
  } catch {
    // updateCampaign handles rollback internally
  }
}

function handleNameUpdate(newName: string) {
  store.name = newName
  saveCampaignMeta({ name: newName })
}

function handleStatusUpdate(newStatus: CampaignStatus) {
  store.status = newStatus
  saveCampaignMeta({ status: newStatus })
}

// Preview opens the donor-facing campaign page
const handlePreview = () => {
  window.open(`/${charityStore.slug}/${store.id}`, '_blank')
}

// After fundraiser is deleted, navigate back to fundraisers list
const handleDeleted = () => {
  navigateTo('/portal/fundraisers')
}
</script>

<template>
  <EditLayout
    v-if="campaign"
    :editable="isTerminal ? undefined : editableMode"
    :breadcrumbs="breadcrumbs"
    :is-dirty="isTerminal ? false : store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="crowdfundingEnabled || isFormTabActive"
    preview-label="Preview"
    :editable-last-item="!isTerminal"
    :max-length="75"
    @preview="handlePreview"
    @update:editable="editableMode = $event"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
    @update:last-item-label="handleNameUpdate"
  >
    <template #header>
      <CampaignHeader
        :can-activate="true"
        portal-mode
        class="mb-2"
        @update:name="handleNameUpdate"
        @update:status="handleStatusUpdate"
        @deleted="handleDeleted"
      />

      <Alert v-if="isTerminal">
        <AlertDescription>
          This fundraiser has {{ store.status === 'completed' ? 'completed' : 'ended' }}. Editing is
          disabled.
        </AlertDescription>
      </Alert>
    </template>

    <template #content>
      <CampaignMasterConfigPanel ref="formRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <template #preview>
      <div :style="brandingStyle">
        <!-- Form preview when Donation Form tab is active -->
        <DonationFormPreview
          v-if="isFormTabActive && store.fullFormConfig"
          :editable="isTerminal ? false : editableMode"
        />
        <!-- Campaign preview for other tabs -->
        <CrowdfundingPagePreview
          v-else-if="crowdfundingEnabled"
          :editable="isTerminal ? false : editableMode"
        />
        <Empty v-else class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ICON_HIDE /></EmptyMedia>
            <EmptyTitle>Preview Unavailable</EmptyTitle>
            <EmptyDescription>
              Crowdfunding Page is currently disabled. Enable it in the settings to see the preview.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </template>
  </EditLayout>
</template>
