<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CampaignHeader from '~/features/campaigns/admin/components/CampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CampaignPreviewSwitcher from '~/features/campaigns/admin/components/CampaignPreviewSwitcher.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { Campaign, CampaignStatus } from '~/features/campaigns/shared/types'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({
  layout: 'portal'
})

const route = useRoute()
const { getCampaignById, updateCampaign } = useCampaigns()
const store = useCampaignConfigStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// Reset accordion state before child components mount
openAccordionId.value = undefined

// Initialize store synchronously so child components have store.id during setup
if (campaign.value) {
  store.initialize(campaign.value)
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

// Reuse admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog, patchBaseline } =
  useAdminEdit({
    store,
    formRef,
    originalData: campaignForStore,
    onSave: async () => {
      if (!store.id) return
      store.commitFormDeletes(store.id)
      await updateCampaign(store.id, {
        name: store.name,
        status: store.status,
        stats: store.stats!,
        crowdfunding: store.crowdfunding!,
        peerToPeer: store.peerToPeer!,
        socialSharing: store.socialSharing!
      })
    }
  })

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
  window.open(`/donor/campaign/${store.id}`, '_blank')
}
</script>

<template>
  <AdminEditLayout
    v-if="campaign"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    editable-last-item
    @preview="handlePreview"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
    @update:last-item-label="handleNameUpdate"
  >
    <template #header>
      <CampaignHeader @update:name="handleNameUpdate" @update:status="handleStatusUpdate" />
    </template>

    <template #content>
      <CampaignMasterConfigPanel ref="formRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <template #preview>
      <CampaignPreviewSwitcher />
    </template>
  </AdminEditLayout>
</template>
