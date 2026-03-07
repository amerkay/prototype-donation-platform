<script setup lang="ts">
import EditLayout from '~/features/_shared/components/EditLayout.vue'
import CampaignHeader from '~/features/campaigns/admin/components/CampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import { ACTIVE_CONFIG_TAB_KEY } from '~/features/campaigns/admin/composables/useActiveConfigTab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CrowdfundingPagePreview from '~/features/campaigns/features/crowdfunding/admin/components/CrowdfundingPagePreview.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import PreviewNotAvailable from '~/features/_admin/components/PreviewNotAvailable.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import { getCampaignTypeBreadcrumb } from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useEditState } from '~/features/_shared/composables/useEditState'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const {
  getCampaignById,
  updateCampaign,
  updateCampaignName,
  updateCampaignStatus,
  archiveCampaign,
  unarchiveCampaign
} = useCampaigns()
const store = useCampaignConfigStore()
const charityStore = useCharitySettingsStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// Initialize store synchronously so child components have store.id during setup
if (campaign.value) {
  store.initialize(campaign.value)
}

onMounted(() => {
  if (!campaign.value) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
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

// Activation guard: requires valid settings + a form
const hasForm = computed(() => store.formConfig.formId !== null)
const canActivate = computed(() => (formRef.value?.isValid ?? false) && hasForm.value)

const isTerminal = computed(() => store.status === 'completed' || store.status === 'ended')
const crowdfundingEnabled = computed(() => store.crowdfunding?.enabled !== false)
const { brandingStyle } = useBrandingCssVars()
const editableMode = ref(!isTerminal.value)

// Preview switching — provide active tab ref for config panel to write to
const activeConfigTab = ref(store.isFundraiser ? 'crowdfunding' : 'donationForm')
provide(ACTIVE_CONFIG_TAB_KEY, activeConfigTab)
// Map config tabs to preview tabs (many-to-one: p2p/matchedGiving → crowdfunding)
const activePreviewTab = computed(() =>
  activeConfigTab.value === 'donationForm' ? 'donationForm' : 'crowdfunding'
)
function onPreviewTabChange(tab: string | number) {
  activeConfigTab.value = String(tab)
}

// Use admin edit composable for save/discard logic (single store — no additionalStores needed)
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog, patchBaseline } =
  useEditState({
    store,
    formRef,
    originalData: campaignForStore,
    onSave: async () => {
      if (!store.id) return
      // Reconstruct CampaignForm from formConfig state
      const assembledForm = store.assembledForm
      await updateCampaign(store.id, {
        name: store.name,
        status: store.status,
        stats: store.stats!,
        crowdfunding: store.crowdfunding!,
        peerToPeer: store.peerToPeer!,
        matchedGiving: store.matchedGiving,
        form: assembledForm ?? store.form
      })
    }
  })

// Breadcrumbs
const breadcrumbs = computed(() => {
  const typeBreadcrumb = getCampaignTypeBreadcrumb({ type: store.type })
  const isP2PType = store.type === 'p2p' || store.type === 'p2p-fundraiser'
  return [
    { label: 'Dashboard', href: '/admin/dashboard' },
    // P2P types need a category crumb ("Peer to Peer > P2P Templates / Fundraiser Pages")
    ...(isP2PType ? [{ label: 'Peer to Peer' }] : []),
    { label: typeBreadcrumb.label, href: typeBreadcrumb.href },
    { label: store.name }
  ]
})

// Save name/status independently (no form validation required)
async function handleNameUpdate(newName: string) {
  if (!store.id) return
  store.name = newName
  try {
    await updateCampaignName(store.id, newName)
    patchBaseline({ name: newName })
  } catch {
    // updateCampaign handles rollback internally
  }
}

async function handleArchiveToggle(archived: boolean) {
  if (!store.id) return
  store.isArchived = archived
  if (archived) {
    await archiveCampaign(store.id)
  } else {
    await unarchiveCampaign(store.id)
  }
  patchBaseline({ isArchived: archived })
}

function canRevertToDraft(newStatus: CampaignStatus): boolean {
  if (newStatus !== 'draft') return true
  if ((store.stats?.totalDonations ?? 0) === 0) return true
  toast.error('Cannot revert to draft', {
    description: 'This campaign has already received donations.'
  })
  return false
}

// Returns the previous end date if it was cleared, null otherwise
function clearPastEndDateIfNeeded(previousStatus: CampaignStatus): string | null {
  const fromLocked = previousStatus === 'completed' || previousStatus === 'ended'
  if (!fromLocked || !store.crowdfunding?.endDate) return null
  const endDate = new Date(store.crowdfunding.endDate)
  if (endDate >= new Date(new Date().toDateString())) return null
  const previousEndDate = store.crowdfunding.endDate
  store.crowdfunding.endDate = null
  formRef.value?.setFieldValue?.('config.sections.crowdfunding.endDate', null)
  return previousEndDate
}

async function handleStatusUpdate(newStatus: CampaignStatus) {
  if (!store.id) return
  if (!canRevertToDraft(newStatus)) return

  const previousStatus = store.status
  const clearedEndDate = clearPastEndDateIfNeeded(previousStatus)

  // Set status first so dynamic rules (e.g. endDate past-check) re-evaluate
  store.status = newStatus
  await nextTick()

  if (newStatus !== 'draft' && !canActivate.value) {
    store.status = previousStatus
    if (clearedEndDate !== null && store.crowdfunding) {
      store.crowdfunding.endDate = clearedEndDate
      formRef.value?.setFieldValue?.('config.sections.crowdfunding.endDate', clearedEndDate)
    }
    toast.error('Cannot change campaign status', {
      description: 'Please fix form errors before changing status.'
    })
    return
  }

  try {
    await updateCampaignStatus(store.id, newStatus)
    patchBaseline({ status: newStatus })
    if (newStatus === 'active' && previousStatus === 'draft') {
      const orgSlug = charityStore.slug?.trim()
      const liveUrl = orgSlug ? `/${orgSlug}/${store.id}` : null
      toast.success('Campaign published', {
        description: 'Your campaign is now live.',
        ...(liveUrl && {
          action: { label: 'View live campaign', onClick: () => window.open(liveUrl, '_blank') }
        })
      })
    }
    if (clearedEndDate !== null) {
      store.markDirty()
      toast.info('End date cleared', {
        description: 'The past end date was removed. You can set a new one if needed.'
      })
      router.replace({ hash: '#config.sections.crowdfunding.endDate' })
    }
  } catch {
    store.status = previousStatus
  }
}

const handlePreview = () => {
  window.open(`/admin/campaigns/${store.id}/preview`, '_blank')
}

// After campaign is deleted, navigate back to the type list
const handleDeleted = () => {
  const typeBreadcrumb = getCampaignTypeBreadcrumb({ type: store.type })
  navigateTo(typeBreadcrumb.href)
}
</script>

<template>
  <EditLayout
    v-if="campaign"
    :editable="isTerminal ? undefined : editableMode"
    :breadcrumbs="breadcrumbs"
    :is-dirty="isTerminal ? false : store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="true"
    preview-label="Preview"
    :editable-last-item="!isTerminal"
    :max-length="75"
    @preview="handlePreview"
    @update:editable="editableMode = $event"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
    @update:last-item-label="handleNameUpdate"
  >
    <!-- Header slot for CampaignHeader -->
    <template #header>
      <CampaignHeader
        :can-activate="canActivate"
        @update:name="handleNameUpdate"
        @update:status="handleStatusUpdate"
        @update:archived="handleArchiveToggle"
        @deleted="handleDeleted"
      />
    </template>

    <!-- Main content -->
    <template #content>
      <CampaignMasterConfigPanel ref="formRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <template #preview>
      <div :style="brandingStyle">
        <Tabs :model-value="activePreviewTab" @update:model-value="onPreviewTabChange">
          <TabsList class="w-full overflow-x-auto" data-preview-nav>
            <TabsTrigger v-if="store.fullFormConfig" value="donationForm" class="text-xs">
              Donation Form
            </TabsTrigger>
            <TabsTrigger value="crowdfunding" class="text-xs"> Crowdfunding Page </TabsTrigger>
          </TabsList>

          <TabsContent v-if="store.fullFormConfig" value="donationForm">
            <DonationFormPreview :editable="isTerminal ? false : editableMode" />
          </TabsContent>

          <TabsContent value="crowdfunding">
            <CrowdfundingPagePreview
              v-if="crowdfundingEnabled"
              :editable="isTerminal ? false : editableMode"
            />
            <PreviewNotAvailable
              v-else
              title="Crowdfunding Page Disabled"
              description="Enable the crowdfunding page to preview it."
            />
          </TabsContent>
        </Tabs>
      </div>
    </template>
  </EditLayout>
</template>
