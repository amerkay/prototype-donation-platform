<script setup lang="ts">
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import { useCampaignCreateWizardForm } from '~/features/campaigns/admin/forms/campaign-create-wizard-form'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'
import { extractDefaultValues } from '~/features/_library/form-builder/utils/defaults'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import DonationFormTemplateGrid from '~/features/donation-form/admin/components/DonationFormTemplateGrid.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ICON_FORWARD, ICON_BACK } from '~/lib/icons'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { createCampaign } = useCampaigns()
const { createFormFromTemplate } = useCreateFormFromTemplate()
const formsStore = useFormsStore()

// Step state
const currentStep = ref(1)
const step1Data = ref<Record<string, unknown>>({})
const formRef = ref<InstanceType<typeof FormRenderer>>()

// Initialize form data with defaults
const formSection = useCampaignCreateWizardForm
const formData = ref(
  extractDefaultValues(
    formSection.setup({ values: computed(() => ({})), form: computed(() => ({})) })
  )
)

// Reset state when dialog opens
watch(
  () => props.open,
  (open) => {
    if (open) {
      currentStep.value = 1
      step1Data.value = {}
      formData.value = extractDefaultValues(
        formSection.setup({ values: computed(() => ({})), form: computed(() => ({})) })
      )
    }
  }
)

const headerTitle = computed(() =>
  currentStep.value === 1 ? 'New Campaign' : 'Choose a Form Template'
)

const headerDescription = computed(() =>
  currentStep.value === 1
    ? 'Set up your campaign details and currency'
    : 'Select a donation form template for your campaign'
)

// Step 1 validated → store data, advance
const handleStep1Submit = () => {
  step1Data.value = { ...formData.value }
  currentStep.value = 2
}

const tryNext = () => {
  formRef.value?.onSubmit()
}

// Step 2: template selected → create campaign + form → navigate
const handleTemplateSelect = (template: DonationFormTemplate) => {
  const title = step1Data.value.title as string
  const currency = step1Data.value.currency as string

  const campaignId = createCampaign({
    type: 'standard',
    name: title,
    crowdfunding: {
      enabled: true,
      currency,
      title,
      shortDescription: step1Data.value.shortDescription as string,
      goalAmount: (step1Data.value.goalAmount as number) || undefined,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      enableSocialSharing: true
    },
    peerToPeer: { enabled: false }
  })

  // Create form from selected template, using campaign currency for smart conversion
  const { formId, formName, config, products } = createFormFromTemplate(
    campaignId,
    template,
    [],
    currency
  )
  formsStore.addForm(campaignId, formId, formName, config, products)

  emit('update:open', false)
  navigateTo(`/admin/campaigns/${campaignId}`)
}
</script>

<template>
  <BaseDialogOrDrawer
    :open="props.open"
    size="xl"
    dismissible
    :description="headerDescription"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span>{{ headerTitle }}</span>
        <Badge variant="outline" class="text-xs"> Step {{ currentStep }} of 2 </Badge>
      </div>
    </template>

    <template #content>
      <!-- Step 1: Campaign Info + Currency -->
      <div v-if="currentStep === 1" class="py-4">
        <FormRenderer
          ref="formRef"
          v-model="formData"
          :section="formSection"
          @submit="handleStep1Submit"
        />
      </div>

      <!-- Step 2: Form Template Selection -->
      <div v-else>
        <DonationFormTemplateGrid @select="handleTemplateSelect" />
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2 w-full">
        <Button v-if="currentStep === 2" variant="outline" @click="currentStep = 1">
          <ICON_BACK class="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button v-if="currentStep === 1" class="ml-auto" @click="tryNext">
          Next: Choose Template
          <ICON_FORWARD class="w-4 h-4 ml-1" />
        </Button>
      </div>
    </template>
  </BaseDialogOrDrawer>
</template>
