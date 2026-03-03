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
import { useForm } from '~/features/campaigns/shared/composables/useForm'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import type { Campaign, CampaignStatus } from '~/features/campaigns/shared/types'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import { useEditState } from '~/features/_shared/composables/useEditState'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { getCampaignById, updateCampaign } = useCampaigns()
const charityStore = useCharitySettingsStore()
const store = useCampaignConfigStore()
const formConfigStore = useFormConfigStore()

// Get campaign data (fundraisers auto-merge parent template fields via getCampaignById)
const campaign = computed(() => getCampaignById(route.params.id as string))
const { form: defaultForm, updateForm } = useForm()

// Reset accordion state before child components mount
openAccordionId.value = undefined

// Initialize both stores synchronously so child components have data during setup
if (campaign.value) {
  store.initialize(campaign.value)
}
if (defaultForm.value) {
  formConfigStore.initialize(
    defaultForm.value.config,
    defaultForm.value.products,
    defaultForm.value.id
  )
}

onMounted(() => {
  if (!campaign.value) {
    throw createError({ statusCode: 404, statusMessage: 'Fundraiser not found' })
  }
})

onUnmounted(() => {
  openAccordionId.value = undefined
})

// Watch for campaign ID changes (navigation between campaigns)
watch(
  () => route.params.id,
  (newId) => {
    openAccordionId.value = undefined
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

// Combined dirty state (campaign config + form config)
const isDirtyComputed = computed(() => store.isDirty || formConfigStore.isDirty)

// Reuse admin edit composable for save/discard logic
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
      matchedGiving: store.matchedGiving
    })
    // Also save form config if dirty
    if (formConfigStore.isDirty && formConfigStore.formId && formConfigStore.fullConfig) {
      await updateForm(formConfigStore.fullConfig, formConfigStore.products)
    }
  }
})

function handleSave() {
  handleCampaignSave()
}

function handleDiscard() {
  handleCampaignDiscard()
  // Also reset donation amounts form
  formRef.value?.amountsResetToSaved?.()
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
  window.open(`/${charityStore.slug}/campaign/${store.id}`, '_blank')
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
    :is-dirty="isTerminal ? false : isDirtyComputed"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="crowdfundingEnabled"
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
        <CrowdfundingPagePreview
          v-if="crowdfundingEnabled"
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
