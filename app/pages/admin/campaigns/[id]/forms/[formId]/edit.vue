<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import AdminDonationFormConfig from '~/features/donation-form/admin/components/AdminDonationFormConfig.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getCampaignById } = useCampaigns()

const campaignId = route.params.id as string
const formId = route.params.formId as string

const { getForm, updateForm } = useForms(campaignId)

const campaign = computed(() => getCampaignById(campaignId))
const form = computed(() => getForm(formId))

// TODO: Remove when switching to Supabase API
// Track if client-side hydration completed (sessionStorage is client-only)
const isHydrated = ref(false)

// Initialize store with form config
const store = useFormConfigStore()

// TODO: Remove when switching to Supabase API
// Check for campaign/form existence after client-side hydration from sessionStorage
onMounted(() => {
  isHydrated.value = true
  if (!campaign.value || !form.value) {
    navigateTo('/admin/campaigns')
    return
  }
  // Initialize store with form config
  store.initialize(form.value.config, form.value.products, form.value.id)
})

// Watch for form changes
watch(
  () => form.value,
  (newForm) => {
    if (newForm) {
      store.initialize(newForm.config, newForm.products, newForm.id)
    }
  }
)

// originalData must read from STORE (current state), not API data
const formForStore = computed(() => {
  if (!store.fullConfig || !store.formId) return undefined
  return [store.fullConfig, store.products, store.formId] as const
})

// Form config ref for validation
const formConfigRef = ref()

// Use admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData: formForStore,
  onSave: async () => {
    if (!store.formId || !store.fullConfig) return
    await updateForm(store.formId, store.fullConfig)
  }
})

// Breadcrumbs
const breadcrumbs = computed(() => [
  { label: 'Dashboard', href: '/' },
  { label: 'Campaigns', href: '/admin/campaigns' },
  { label: campaign.value?.name || '', href: `/admin/campaigns/${campaign.value?.id}` },
  { label: form.value?.name || '' }
])

// Preview handler
const handlePreview = () => {
  window.open(`/admin/campaigns/${campaignId}/forms/${formId}/preview`, '_blank')
}
</script>

<template>
  <!-- TODO: Remove loading state when switching to Supabase API -->
  <div v-if="!isHydrated" class="flex items-center justify-center min-h-screen">
    <div class="text-muted-foreground">Loading...</div>
  </div>
  <AdminEditLayout
    v-else-if="campaign && form"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    preview-label="Form Preview"
    @preview="handlePreview"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
  >
    <!-- Main content -->
    <template #content>
      <AdminDonationFormConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
    </template>

    <!-- Preview panel -->
    <template #preview-label>Form Preview</template>
    <template #preview>
      <DonationFormPreview />
    </template>
  </AdminEditLayout>
</template>
