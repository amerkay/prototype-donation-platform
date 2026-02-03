<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import CompactCampaignHeader from '~/features/campaigns/admin/components/CompactCampaignHeader.vue'
import CampaignMasterConfigPanel from '~/features/campaigns/admin/components/CampaignMasterConfigPanel.vue'
import CampaignPreviewSwitcher from '~/features/campaigns/admin/components/CampaignPreviewSwitcher.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignTypeBreadcrumb } from '~/features/campaigns/shared/composables/useCampaignTypes'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getCampaignById, updateCampaign } = useCampaigns()
const store = useCampaignConfigStore()

// Get campaign data
const campaign = computed(() => getCampaignById(route.params.id as string))

// TODO: Remove when switching to Supabase API
// Track if client-side hydration completed (sessionStorage is client-only)
const isHydrated = ref(false)

// TODO: Remove when switching to Supabase API
// Check for campaign existence after client-side hydration from sessionStorage
onMounted(() => {
  isHydrated.value = true
  if (!campaign.value) {
    throw createError({ statusCode: 404, statusMessage: 'Campaign not found' })
  }
  // Initialize store with campaign data
  store.initialize(campaign.value)
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

// Use admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
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

// Preview handler
const handlePreview = () => {
  window.open(`/admin/campaigns/${store.id}/preview`, '_blank')
}
</script>

<template>
  <!-- TODO: Remove loading state when switching to Supabase API (will fetch from API instead) -->
  <div v-if="!isHydrated" class="flex items-center justify-center min-h-screen">
    <div class="text-muted-foreground">Loading...</div>
  </div>
  <AdminEditLayout
    v-else-if="campaign"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    @preview="handlePreview"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
  >
    <!-- Header slot for CompactCampaignHeader -->
    <template #header>
      <CompactCampaignHeader />
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
