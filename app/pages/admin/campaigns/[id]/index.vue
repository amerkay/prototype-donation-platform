<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CampaignHeader from '~/features/campaigns/admin/components/CampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CrowdfundingPagePreview from '~/features/campaigns/admin/components/CrowdfundingPagePreview.vue'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { EyeOff } from 'lucide-vue-next'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import type { CampaignStatus } from '~/features/campaigns/shared/types'
import { getCampaignTypeBreadcrumb } from '~/features/campaigns/shared/composables/useCampaignTypes'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
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

const crowdfundingEnabled = computed(() => store.crowdfunding?.enabled !== false)
const { brandingStyle } = useBrandingCssVars()
const editableMode = ref(true)

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
        peerToPeer: store.peerToPeer!
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
  // Prevent reverting to draft once donations have been received
  if (newStatus === 'draft' && (store.stats?.totalDonations ?? 0) > 0) {
    toast.error('Cannot revert to draft', {
      description: 'This campaign has already received donations.'
    })
    return
  }
  const previousStatus = store.status

  // Auto-clear past end date when reactivating from completed/archived
  // A past date is meaningless for a reactivated campaign
  const fromLocked = previousStatus === 'completed' || previousStatus === 'archived'
  let clearedEndDate = false
  let previousEndDate: string | null = null
  if (fromLocked && store.crowdfunding?.endDate) {
    const endDate = new Date(store.crowdfunding.endDate)
    if (endDate < new Date(new Date().toDateString())) {
      previousEndDate = store.crowdfunding.endDate
      store.crowdfunding.endDate = null
      // Sync to vee-validate (store → form is one-way, needs explicit push)
      formRef.value?.setFieldValue?.('crowdfunding.endDate', null)
      clearedEndDate = true
    }
  }

  // Set status first so dynamic rules (e.g. endDate past-check) re-evaluate
  store.status = newStatus

  // Let vee-validate re-validate with the cleared value and new status
  await nextTick()

  if (newStatus !== 'draft' && !canActivate.value) {
    store.status = previousStatus
    if (clearedEndDate && store.crowdfunding) {
      store.crowdfunding.endDate = previousEndDate
      formRef.value?.setFieldValue?.('crowdfunding.endDate', previousEndDate)
    }
    toast.error('Cannot change campaign status', {
      description: 'Please fix form errors before changing status.'
    })
    return
  }
  try {
    await updateCampaignStatus(store.id, newStatus)
    patchBaseline({ status: newStatus })
    if (clearedEndDate) {
      store.markDirty()
      toast.info('End date cleared', {
        description: 'The past end date was removed. You can set a new one if needed.'
      })
      // Navigate to the cleared field so the hash target highlights it
      router.replace({ hash: '#crowdfunding.endDate' })
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
  <AdminEditLayout
    v-if="campaign"
    v-model:editable="editableMode"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    :show-preview="crowdfundingEnabled"
    preview-label="Preview"
    editable-last-item
    :max-length="75"
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

    <template #preview>
      <div :style="brandingStyle">
        <CrowdfundingPagePreview v-if="crowdfundingEnabled" :editable="editableMode" />
        <Empty v-else class="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon"><EyeOff /></EmptyMedia>
            <EmptyTitle>Preview Unavailable</EmptyTitle>
            <EmptyDescription>
              Crowdfunding Page is currently disabled. Enable it in the settings to see the preview.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </template>
  </AdminEditLayout>
</template>
