<script setup lang="ts">
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import { useForm } from '~/features/campaigns/shared/composables/useForm'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import AdminDeleteDialog from '~/features/_admin/components/AdminDeleteDialog.vue'
import CopyFormFromCampaignDialog from './CopyFormFromCampaignDialog.vue'
import DonationFormTemplatesDialog from '~/features/donation-form/admin/components/DonationFormTemplatesDialog.vue'
import { ICON_COPY, ICON_SPARKLES } from '~/lib/icons'
import type { CampaignForm } from '~/features/campaigns/shared/types'
defineOptions({ inheritAttrs: false })

const store = useCampaignConfigStore()
const { setForm } = useForm()
const { createFormFromTemplate } = useCreateFormFromTemplate()
const caps = computed(() => getCampaignCapabilities(store.type))

// Count enabled features
const enabledFeaturesCount = computed(() => {
  const fc = store.formConfig
  const features = [
    fc.impactCart,
    fc.productSelector,
    fc.impactBoost,
    fc.coverCosts,
    fc.tribute,
    fc.entryFields,
    fc.contactConsent,
    fc.terms
  ]
  return features.filter((f) => (f as { enabled?: boolean } | null)?.enabled === true).length
})

// Count products
const productCount = computed(() => store.formConfig.products.length)

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
  <div v-if="store.formConfig.formId" class="space-y-3">
    <!-- Toolbar: summary + actions -->
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="outline" class="text-xs">
          {{ caps.formType === 'registration' ? 'Registration' : 'Donation' }}
        </Badge>
        <span>{{ enabledFeaturesCount }} features</span>
        <span>&middot;</span>
        <span>{{ productCount }} product{{ productCount !== 1 ? 's' : '' }}</span>
      </div>
      <div v-if="!store.isFundraiser" class="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" @click="showCopyDialog = true">
          <ICON_COPY class="w-4 h-4 mr-1" />
          Copy from
        </Button>
        <Button variant="outline" size="sm" @click="showTemplateDialog = true">
          <ICON_SPARKLES class="w-4 h-4 mr-1" />
          Replace with template
        </Button>
      </div>
    </div>
  </div>

  <!-- No form state -->
  <div v-else class="space-y-3">
    <div class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      <p>No form configured yet.</p>
      <p class="mt-1">Create a form from a template or copy from another campaign.</p>
    </div>
    <div v-if="!store.isFundraiser" class="flex gap-2 flex-wrap">
      <Button variant="outline" size="sm" @click="showTemplateDialog = true">
        <ICON_SPARKLES class="w-4 h-4 mr-1" />
        Create from template
      </Button>
      <Button variant="outline" size="sm" @click="showCopyDialog = true">
        <ICON_COPY class="w-4 h-4 mr-1" />
        Copy from another campaign
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
</template>
