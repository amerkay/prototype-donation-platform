<script setup lang="ts">
import type { Campaign } from '~/features/campaigns/shared/types'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { getPresetById } from '~/features/campaigns/admin/templates'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import {
  useP2PDetailsForm,
  createP2PCustomiseForm
} from '~/features/campaigns/donor/forms/p2p-onboarding-form'
import { extractDefaultValues } from '~/features/_library/form-builder/utils/defaults'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PartyPopper,
  User,
  Pencil,
  Eye,
  Heart
} from 'lucide-vue-next'

const props = defineProps<{
  campaign: Campaign
}>()

const { createCampaign } = useCampaigns()
const charityStore = useCharitySettingsStore()

// Preset icon lookup
const presetIcon = computed(() => {
  if (!props.campaign.p2pPreset) return Heart
  return getPresetById(props.campaign.p2pPreset)?.metadata.icon ?? Heart
})

// Step state
const currentStep = ref(1)
const totalSteps = 4
const progressPercent = computed(() => (currentStep.value / totalSteps) * 100)

const stepIcons = [PartyPopper, User, Pencil, Eye]
const stepLabels = ['Welcome', 'Your Details', 'Customise', 'Preview']

// Form definitions
const customiseForm = computed(() =>
  createP2PCustomiseForm({
    pageTitle: props.campaign.crowdfunding.title,
    goal: props.campaign.crowdfunding.goalAmount ?? 500,
    story: props.campaign.crowdfunding.story
  })
)

// Form data (reactive v-models for FormRenderer)
const detailsData = ref(
  extractDefaultValues(
    useP2PDetailsForm.setup({ values: computed(() => ({})), form: computed(() => ({})) })
  )
)
const customiseData = ref<Record<string, unknown>>({})

// Initialize customise data when form is computed
watch(
  customiseForm,
  (form) => {
    customiseData.value = extractDefaultValues(
      form.setup({ values: computed(() => ({})), form: computed(() => ({})) })
    )
  },
  { immediate: true }
)

// Form refs for validation
const detailsFormRef = ref<InstanceType<typeof FormRenderer>>()
const customiseFormRef = ref<InstanceType<typeof FormRenderer>>()

// Navigation
const nextStep = () => {
  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const handleDetailsSubmit = () => {
  nextStep()
}

const handleCustomiseSubmit = () => {
  nextStep()
}

const tryNextFromDetails = () => {
  detailsFormRef.value?.onSubmit()
}

const tryNextFromCustomise = () => {
  customiseFormRef.value?.onSubmit()
}

// Computed display values from form data
const firstName = computed(() => {
  const nameGroup = detailsData.value.name as Record<string, unknown> | undefined
  return (nameGroup?.firstName as string) || ''
})

const lastName = computed(() => {
  const nameGroup = detailsData.value.name as Record<string, unknown> | undefined
  return (nameGroup?.lastName as string) || ''
})

const pageTitle = computed(() => (customiseData.value.pageTitle as string) || '')
const goal = computed(() => (customiseData.value.goal as number) || 0)
const story = computed(() => (customiseData.value.story as string) || '')

// Launch
const launched = ref(false)
const createdCampaignId = ref<string>()

const handleLaunch = () => {
  const id = createCampaign({
    type: 'fundraiser',
    parentCampaignId: props.campaign.id,
    p2pPreset: props.campaign.p2pPreset,
    name: `${firstName.value}'s Fundraiser`,
    crowdfunding: {
      enabled: true,
      title: pageTitle.value,
      shortDescription: props.campaign.crowdfunding.shortDescription,
      story: story.value,
      showProgressBar: true,
      showRecentDonations: true,
      defaultDonationsView: 'recent',
      numberOfDonationsToShow: 5,
      goalAmount: goal.value
    },
    peerToPeer: { enabled: false },
    socialSharing: { ...props.campaign.socialSharing }
  })

  createdCampaignId.value = id
  launched.value = true
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Progress -->
    <div class="space-y-2">
      <div class="flex justify-between text-xs text-muted-foreground">
        <span
          v-for="(label, i) in stepLabels"
          :key="label"
          class="flex items-center gap-1"
          :class="{ 'text-foreground font-medium': currentStep === i + 1 }"
        >
          <component :is="stepIcons[i]" class="w-3 h-3" />
          <span class="hidden sm:inline">{{ label }}</span>
        </span>
      </div>
      <Progress :model-value="progressPercent" class="h-1.5" />
    </div>

    <!-- Step 1: Welcome -->
    <Card v-if="currentStep === 1 && !launched">
      <CardHeader class="text-center space-y-3">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <component :is="presetIcon" class="w-8 h-8 text-primary" />
        </div>
        <CardTitle class="text-xl">{{ campaign.name }}</CardTitle>
        <CardDescription class="text-base leading-relaxed max-w-md mx-auto">
          {{ campaign.crowdfunding.shortDescription }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <Separator />
        <div class="text-sm text-muted-foreground space-y-2">
          <p>In the next steps you will:</p>
          <ul class="space-y-1 ml-4">
            <li class="flex items-start gap-2">
              <Check class="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Enter your personal details</span>
            </li>
            <li class="flex items-start gap-2">
              <Check class="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Customise your fundraising page with a title, goal, and story</span>
            </li>
            <li class="flex items-start gap-2">
              <Check class="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Preview and launch your page</span>
            </li>
          </ul>
        </div>
        <Button class="w-full" @click="nextStep">
          Get Started
          <ArrowRight class="w-4 h-4 ml-1" />
        </Button>
      </CardContent>
    </Card>

    <!-- Step 2: Personal Details (FormRenderer) -->
    <Card v-if="currentStep === 2 && !launched">
      <CardContent class="pt-6">
        <FormRenderer
          ref="detailsFormRef"
          v-model="detailsData"
          :section="useP2PDetailsForm"
          @submit="handleDetailsSubmit"
        />
        <div class="flex gap-2 pt-4">
          <Button variant="outline" @click="prevStep">
            <ArrowLeft class="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button class="flex-1" @click="tryNextFromDetails">
            Continue
            <ArrowRight class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 3: Customise (FormRenderer) -->
    <Card v-if="currentStep === 3 && !launched">
      <CardContent class="pt-6">
        <FormRenderer
          ref="customiseFormRef"
          v-model="customiseData"
          :section="customiseForm"
          @submit="handleCustomiseSubmit"
        />
        <div class="flex gap-2 pt-4">
          <Button variant="outline" @click="prevStep">
            <ArrowLeft class="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button class="flex-1" @click="tryNextFromCustomise">
            Preview
            <Eye class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Step 4: Preview & Launch -->
    <Card v-if="currentStep === 4 && !launched">
      <CardHeader>
        <CardTitle>Preview Your Page</CardTitle>
        <CardDescription>
          Here's how your fundraising page will look. Ready to launch?
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <!-- Preview card -->
        <div class="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <component :is="presetIcon" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold text-sm">{{ pageTitle }}</h3>
              <p class="text-xs text-muted-foreground">by {{ firstName }} {{ lastName }}</p>
            </div>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>£0 raised</span>
              <span>Goal: £{{ goal.toLocaleString() }}</span>
            </div>
            <Progress :model-value="0" class="h-2" />
          </div>
          <p class="text-sm text-muted-foreground whitespace-pre-line line-clamp-4">
            {{ story }}
          </p>
        </div>

        <Separator />

        <div class="text-sm text-muted-foreground text-center">
          <p>
            Fundraising for <strong>{{ charityStore.name }}</strong>
          </p>
        </div>

        <div class="flex gap-2 pt-2">
          <Button variant="outline" @click="prevStep">
            <ArrowLeft class="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button class="flex-1" @click="handleLaunch">
            Launch My Page
            <PartyPopper class="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Success State -->
    <Card v-if="launched">
      <CardContent class="py-10 text-center space-y-4">
        <div
          class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto"
        >
          <Check class="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 class="text-xl font-bold">Your Page is Live!</h2>
        <p class="text-muted-foreground max-w-md mx-auto">
          Congratulations, {{ firstName }}! Your "{{ pageTitle }}" fundraising page has been
          created. Share it with friends and family to start collecting donations.
        </p>
        <p class="text-xs text-muted-foreground italic">
          (This is a prototype — the campaign was saved to session storage)
        </p>
        <NuxtLink
          :to="`/${charityStore.slug}/campaign/${createdCampaignId}`"
          class="inline-block pt-2"
        >
          <Button>View your newly created campaign</Button>
        </NuxtLink>
      </CardContent>
    </Card>
  </div>
</template>
