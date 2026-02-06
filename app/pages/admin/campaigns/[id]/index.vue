<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CampaignHeader from '~/features/campaigns/admin/components/CampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CampaignPreviewSwitcher from '~/features/campaigns/admin/components/CampaignPreviewSwitcher.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useCampaignPreview } from '~/features/campaigns/shared/composables/useCampaignPreview'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import { getCampaignTypeBreadcrumb } from '~/features/campaigns/shared/composables/useCampaignTypes'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getCampaignById, updateCampaign, updateCampaignName, updateCampaignStatus } = useCampaigns()
const store = useCampaignConfigStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// Reset accordion state before child components mount (clears stale state from previous campaigns)
openAccordionId.value = undefined

// Initialize store synchronously so child components have store.id during setup
if (campaign.value) {
  store.initialize(campaign.value)
}

onMounted(() => {
  if (!campaign.value) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
  }
})

// Clean up accordion state when leaving the page
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

// Activation guard: requires valid settings + at least one form
const { forms } = useForms(store.id!)
const formsCount = computed(
  () => forms.value.filter((f) => !store.pendingFormDeletes.has(f.id)).length
)
const canActivate = computed(() => (formRef.value?.isValid ?? false) && formsCount.value > 0)

// Preview state (centralised composable)
const { hasActivePreview, isFormContext, previewLabel, defaultForm } = useCampaignPreview(store.id!)

// Use admin edit composable for save/discard logic
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

// Breadcrumbs
const breadcrumbs = computed(() => {
  const typeBreadcrumb = getCampaignTypeBreadcrumb({ type: store.type })
  return [
    { label: 'Dashboard', href: '/' },
    { label: 'Campaigns', href: '/admin/campaigns/standard' },
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

async function handleStatusUpdate(newStatus: CampaignStatus) {
  if (!store.id) return
  if (newStatus !== 'draft' && !canActivate.value) {
    toast.error('Cannot change campaign status', {
      description: 'Requires valid settings and at least one form.'
    })
    return
  }
  store.status = newStatus
  try {
    await updateCampaignStatus(store.id, newStatus)
    patchBaseline({ status: newStatus })
  } catch {
    // updateCampaign handles rollback internally
  }
}

// Preview handler — context-aware: opens form preview when viewing donation forms
const handlePreview = () => {
  if (isFormContext.value && defaultForm.value) {
    window.open(`/admin/campaigns/${store.id}/forms/${defaultForm.value.id}/preview`, '_blank')
  } else {
    window.open(`/admin/campaigns/${store.id}/preview`, '_blank')
  }
}

// After campaign is deleted, navigate back to the type list
const handleDeleted = () => {
  const typeBreadcrumb = getCampaignTypeBreadcrumb({ type: store.type })
  navigateTo(typeBreadcrumb.href)
}
</script>

<template>
  <AdminEditLayout
    v-if="campaign"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="hasActivePreview"
    :preview-label="previewLabel"
    editable-last-item
    @preview="handlePreview"
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
        @deleted="handleDeleted"
      />
    </template>

    <!-- Main content -->
    <template #content>
      <CampaignMasterConfigPanel ref="formRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <!-- Preview panel -->
    <template #preview>
      <CampaignPreviewSwitcher />
    </template>
  </AdminEditLayout>
</template>
