import { computed } from 'vue'
import { openAccordionId } from '~/features/campaigns/admin/forms/campaign-config-master'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { useForms } from '~/features/campaigns/shared/composables/useForms'

interface PreviewSection {
  id: string
  label: string
  isDisabled: (store: ReturnType<typeof useCampaignConfigStore>) => boolean
  isEmpty: (defaultForm: ReturnType<typeof useForms>['defaultForm']) => boolean
}

const SECTIONS: PreviewSection[] = [
  {
    id: 'donationForms',
    label: 'Donation Forms',
    isDisabled: () => false,
    isEmpty: (defaultForm) => !defaultForm.value
  },
  {
    id: 'crowdfunding',
    label: 'Crowdfunding Page',
    isDisabled: (store) => store.crowdfunding?.enabled === false,
    isEmpty: () => false
  },
  {
    id: 'socialSharing',
    label: 'Social Sharing',
    isDisabled: (store) => store.socialSharing?.enabled === false,
    isEmpty: () => false
  }
]

const SECTION_IDS = new Set(SECTIONS.map((s) => s.id))

/**
 * Campaign preview state composable
 *
 * Centralises all preview routing/state logic. Reads the open accordion ID
 * and campaign config store to determine which preview section is active
 * and whether it can actually render.
 */
export function useCampaignPreview(campaignId: string) {
  const store = useCampaignConfigStore()
  const { defaultForm } = useForms(campaignId)

  // Which section accordion is currently open (null = none with a preview)
  const activeSection = computed<string | null>(() => {
    if (store.isFundraiser) return 'crowdfunding'
    const fieldName = openAccordionId.value?.split('.').pop()
    return fieldName && SECTION_IDS.has(fieldName) ? fieldName : null
  })

  const currentConfig = computed(() => SECTIONS.find((s) => s.id === activeSection.value))

  // Current section's feature is disabled
  const isDisabled = computed(() => currentConfig.value?.isDisabled(store) ?? false)

  // Current section has empty state (e.g. no forms)
  const isEmpty = computed(() => currentConfig.value?.isEmpty(defaultForm) ?? false)

  // Real preview rendering — section is active, not disabled, and not empty
  const hasActivePreview = computed(
    () => !!activeSection.value && !isDisabled.value && !isEmpty.value
  )

  // Is the donation forms section active with a form available?
  const isFormContext = computed(
    () => activeSection.value === 'donationForms' && !!defaultForm.value
  )

  // Label for the preview button
  const previewLabel = computed(() => (isFormContext.value ? 'Form Preview' : 'Preview'))

  // Human-readable section label for messages
  const featureName = computed(() => currentConfig.value?.label ?? 'This feature')

  // Show external preview button (hide for social sharing as it's inline only)
  const showExternalPreview = computed(
    () => hasActivePreview.value && activeSection.value !== 'socialSharing'
  )

  return {
    activeSection,
    hasActivePreview,
    showExternalPreview,
    isFormContext,
    previewLabel,
    isDisabled,
    isEmpty,
    featureName,
    defaultForm
  }
}
