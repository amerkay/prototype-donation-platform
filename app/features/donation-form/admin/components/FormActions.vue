<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useForm } from '~/features/campaigns/shared/composables/useForm'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import { Button } from '@/components/ui/button'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import CopyFormFromCampaignDialog from '~/features/campaigns/admin/components/CopyFormFromCampaignDialog.vue'
import DonationFormTemplatesDialog from '~/features/donation-form/admin/components/DonationFormTemplatesDialog.vue'
import { ICON_COPY, ICON_REPLACE } from '~/lib/icons'
import FieldHelpText from '~/features/_library/form-builder/internal/FieldHelpText.vue'
import type { CampaignForm } from '~/features/campaigns/shared/types'

const props = defineProps<{
  helpText?: string
}>()

const store = useCampaignConfigStore()
const { setForm } = useForm()
const { createFormFromTemplate } = useCreateFormFromTemplate()

// Copy from campaign flow
const showCopyDialog = ref(false)
const showCopyConfirm = ref(false)
const pendingCopyForm = ref<CampaignForm | null>(null)

const handleCopySelect = (selectedForm: CampaignForm, _sourceCampaignId: string) => {
  if (store.formConfig.formId) {
    pendingCopyForm.value = selectedForm
    showCopyConfirm.value = true
  } else {
    setForm(selectedForm)
  }
}

const handleCopyConfirm = () => {
  if (pendingCopyForm.value) {
    setForm(pendingCopyForm.value)
    pendingCopyForm.value = null
  }
  showCopyConfirm.value = false
}

// Replace with template flow
const showTemplateDialog = ref(false)
const showTemplateConfirm = ref(false)
const pendingTemplate = ref<DonationFormTemplate | null>(null)

const handleTemplateSelect = (template: DonationFormTemplate) => {
  if (store.formConfig.formId) {
    pendingTemplate.value = template
    showTemplateConfirm.value = true
  } else {
    applyTemplate(template)
  }
}

const applyTemplate = (template: DonationFormTemplate) => {
  const campaignId = store.id ?? ''
  const currency = store.crowdfunding?.currency || 'GBP'
  const { formId, formName, config, products } = createFormFromTemplate(
    campaignId,
    template,
    [],
    currency,
    store.type
  )
  setForm({
    id: formId,
    campaignId,
    name: formName,
    isDefault: true,
    config,
    products,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
}

const handleTemplateConfirm = () => {
  if (pendingTemplate.value) {
    applyTemplate(pendingTemplate.value)
    pendingTemplate.value = null
  }
  showTemplateConfirm.value = false
}
</script>

<template>
  <div>
    <!-- Actions when form exists -->
    <div v-if="store.formConfig.formId" class="flex items-center gap-2 flex-wrap">
    <Button variant="outline" size="sm" @click="showCopyDialog = true">
      <ICON_COPY class="w-4 h-4 mr-1" />
      Copy Form from
    </Button>
    <Button variant="outline" size="sm" @click="showTemplateDialog = true">
      <ICON_REPLACE class="w-4 h-4 mr-1" />
      Replace Form with Template
    </Button>
    <FieldHelpText v-if="props.helpText" icon-class="size-4">{{ props.helpText }}</FieldHelpText>
  </div>

  <!-- Empty state -->
  <div v-else class="space-y-3">
    <div class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      <p>No form configured yet.</p>
      <p class="mt-1">Create a form from a template or copy from another campaign.</p>
    </div>
    <div class="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" @click="showTemplateDialog = true">
        <ICON_REPLACE class="w-4 h-4 mr-1" />
        Create from Template
      </Button>
      <Button variant="outline" size="sm" @click="showCopyDialog = true">
        <ICON_COPY class="w-4 h-4 mr-1" />
        Copy from Campaign
      </Button>
    </div>
  </div>

  <!-- Copy from campaign dialog -->
  <CopyFormFromCampaignDialog
    :open="showCopyDialog"
    :current-campaign-id="store.id ?? ''"
    @update:open="showCopyDialog = $event"
    @select="handleCopySelect"
  />

  <!-- Replace with template dialog -->
  <DonationFormTemplatesDialog
    :open="showTemplateDialog"
    :campaign-id="store.id ?? ''"
    :campaign-type="store.type"
    @update:open="showTemplateDialog = $event"
    @select="handleTemplateSelect"
  />

  <!-- Confirmation dialog for replacing existing form (copy) -->
  <AdminDeleteDialog
    :open="showCopyConfirm"
    title="Replace current form?"
    description="This will replace the current form configuration and products with the selected campaign's form. This action cannot be undone."
    confirm-label="Replace Form"
    @update:open="showCopyConfirm = $event"
    @confirm="handleCopyConfirm"
  />

  <!-- Confirmation dialog for replacing with template -->
  <AdminDeleteDialog
    :open="showTemplateConfirm"
    title="Replace with template?"
    description="This will replace the current form configuration and products with the selected template. This action cannot be undone."
    confirm-label="Replace Form"
    @update:open="showTemplateConfirm = $event"
    @confirm="handleTemplateConfirm"
  />
  </div>
</template>
