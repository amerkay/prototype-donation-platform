<script setup lang="ts">
import AdminEditLayout from '~/features/_admin/components/AdminEditLayout.vue'
import AdminDonationFormConfig from '~/features/donation-form/admin/components/AdminDonationFormConfig.vue'
import DonationFormPreview from '~/features/donation-form/admin/components/DonationFormPreview.vue'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useForms } from '~/features/campaigns/shared/composables/useForms'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useAdminEdit } from '~/features/_admin/composables/useAdminEdit'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const { getCampaignById } = useCampaigns()

const campaignId = route.params.id as string
const formId = route.params.formId as string

const { getForm, updateForm, renameForm } = useForms(campaignId)

const campaign = computed(() => getCampaignById(campaignId))
const form = computed(() => getForm(formId))

// Initialize store synchronously so child components have store data during setup
const store = useFormConfigStore()
const { brandingStyle } = useBrandingCssVars()
const editableMode = ref(true)
if (form.value) {
  store.initialize(form.value.config, form.value.products, form.value.id)
}

onMounted(() => {
  if (!campaign.value || !form.value) {
    navigateTo('/admin/campaigns')
  }
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

// originalData must return a deep-cloned snapshot to prevent mutation
const originalData = computed(() => store.toSnapshot())

// Form config ref for validation
const formConfigRef = ref()

// Use admin edit composable for save/discard logic
const { handleSave, handleDiscard, confirmDiscard, showDiscardDialog } = useAdminEdit({
  store,
  formRef: formConfigRef,
  originalData,
  onSave: async () => {
    if (!store.formId || !store.fullConfig) return
    await updateForm(store.formId, store.fullConfig, store.products)
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
  <AdminEditLayout
    v-if="campaign && form"
    v-model:editable="editableMode"
    :breadcrumbs="breadcrumbs"
    :is-dirty="store.isDirty"
    :show-discard-dialog="showDiscardDialog"
    preview-label="Form Preview"
    editable-last-item
    :max-length="75"
    @preview="handlePreview"
    @update:show-discard-dialog="showDiscardDialog = $event"
    @confirm-discard="confirmDiscard"
    @update:last-item-label="renameForm(formId, $event)"
  >
    <!-- Main content -->
    <template #content>
      <AdminDonationFormConfig ref="formConfigRef" @save="handleSave" @discard="handleDiscard" />
    </template>
    <template #preview-label>Form Preview</template>
    <template #preview>
      <div :style="brandingStyle">
        <DonationFormPreview :editable="editableMode" />
      </div>
    </template>
  </AdminEditLayout>
</template>
