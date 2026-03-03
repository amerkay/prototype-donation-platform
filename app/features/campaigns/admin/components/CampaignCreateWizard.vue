<script setup lang="ts">
import type { DonationFormTemplate } from '~/features/donation-form/admin/templates'
import type { CampaignType, P2PPreset } from '~/features/campaigns/shared/types'
import { useCampaignCreateWizardForm } from '~/features/campaigns/admin/forms/campaign-create-wizard-form'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useCreateFormFromTemplate } from '~/features/donation-form/admin/composables/useCreateFormFromTemplate'
import { getPresetById } from '~/features/campaigns/features/p2p/admin/templates'
import { extractDefaultValues } from '~/features/_library/form-builder/utils/defaults'
import { getCampaignEditPath } from '~/features/campaigns/shared/composables/useCampaignTypes'
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
    : 'Select a form template for your campaign'
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
  const campaignType = (step1Data.value.campaignType as CampaignType) || 'standard'
  const p2pPreset = step1Data.value.p2pPreset as P2PPreset | undefined

  // Apply P2P preset defaults if applicable
  const presetDefaults =
    campaignType === 'p2p' && p2pPreset ? getPresetById(p2pPreset)?.factory() : undefined

  const campaignId = createCampaign({
    type: campaignType,
    ...(p2pPreset && campaignType === 'p2p' ? { p2pPreset } : {}),
    name: title,
    crowdfunding: {
      enabled: true,
      currency,
      title: presetDefaults?.crowdfunding?.title ?? title,
      shortDescription:
        presetDefaults?.crowdfunding?.shortDescription ??
        (step1Data.value.shortDescription as string),
      story: presetDefaults?.crowdfunding?.story,
      goalAmount: (step1Data.value.goalAmount as number) || undefined,
      endDate: (step1Data.value.endDate as string) || undefined,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      enableSocialSharing: true
    },
    peerToPeer: {
      enabled: campaignType === 'p2p',
      ...(presetDefaults?.peerToPeer ?? {})
    },
    matchedGiving: { periods: [] }
  })

  // Create form from selected template (1:1 — set directly on campaign)
  const { formId, formName, config, products } = createFormFromTemplate(
    campaignId,
    template,
    [],
    currency
  )

  // Update campaign with the form
  const { updateCampaign } = useCampaigns()
  updateCampaign(campaignId, {
    form: {
      id: formId,
      campaignId,
      name: formName,
      isDefault: true,
      config,
      products,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  })

  emit('update:open', false)
  navigateTo(getCampaignEditPath(campaignType, campaignId))
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
      <!-- Step 1: Campaign Info + Type + Currency -->
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
