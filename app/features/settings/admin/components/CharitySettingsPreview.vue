<script setup lang="ts">
import { ref, computed, watch, nextTick, provide } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-vue-next'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import CoverCostsInfoCard from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsInfoCard.vue'
import CoverCostsModalContent from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsModalContent.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { defineForm } from '~/features/_library/form-builder/api'
import { createTermsAcceptanceField } from '~/features/donation-form/features/terms/donor/forms/terms-acceptance-field'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import {
  charityActiveTab,
  charityOpenAccordionId
} from '~/features/settings/admin/forms/charity-settings-form'
import {
  activateHashTarget,
  HASH_TARGET_PASSIVE_KEY
} from '~/features/_library/form-builder/composables/useHashTarget'

const props = withDefaults(
  defineProps<{
    editable?: boolean
    selectedCurrency?: string
  }>(),
  { editable: false }
)

const emit = defineEmits<{
  'update:selectedCurrency': [value: string]
}>()

// Prevent preview FormRenderers from stealing the global hash target activator
provide(HASH_TARGET_PASSIVE_KEY, true)

const currencyStore = useCurrencySettingsStore()
const { brandingStyle } = useBrandingCssVars()
const charityStore = useCharitySettingsStore()

const activeTab = ref('receipt')
const selectedCurrency = computed({
  get: () => props.selectedCurrency ?? currencyStore.defaultCurrency,
  set: (v) => emit('update:selectedCurrency', v)
})

// Accordion IDs match form section prefix + field name
const ACCORDION_IDS = {
  charityDetails: 'charitySettings.charitySettings',
  costs: 'charitySettings.charityCosts',
  terms: 'charitySettings.terms'
} as const

// --- Receipt targets (currency-aware) ---

const charityReceiptTargets = computed(() => ({
  charity: `charitySettings.currencyTabs.${selectedCurrency.value}`,
  phone: `charitySettings.currencyTabs.${selectedCurrency.value}.phone`,
  website: `charitySettings.currencyTabs.${selectedCurrency.value}.website`,
  description: `charitySettings.currencyTabs.${selectedCurrency.value}.description`,
  emailSignature: `charitySettings.currencyTabs.${selectedCurrency.value}.emailSignature`,
  logo: 'branding.logo'
}))

// --- Costs targets ---

const costsTargets = {
  heading: 'charityCosts.heading',
  introText: 'charityCosts.introText',
  outroText: 'charityCosts.outroText',
  costs: 'charityCosts.costs'
}

// --- Terms preview ---

const termsPreviewData = ref({ acceptTerms: false })
const termsSettings = computed(() => charityStore.terms?.settings)
const termsPreviewSection = computed(() => {
  const config = charityStore.terms?.settings
  return defineForm('termsPreview', () => createTermsAcceptanceField(undefined, config))
})

// Reactive key to force re-mount when config changes
const termsPreviewKey = computed(
  () =>
    `${termsSettings.value?.label}-${termsSettings.value?.description}-${termsSettings.value?.mode}`
)

// --- Bi-directional sync ---

// Suppress reverse sync when programmatically setting values
let suppressAccordionToTab = false
let suppressTabToAccordion = false
let suppressHashActivation = false

// Form currency tab → preview currency + switch to receipt tab
watch(charityActiveTab, (tab) => {
  if (tab && currencyStore.supportedCurrencies.includes(tab)) {
    suppressHashActivation = true
    suppressTabToAccordion = true
    selectedCurrency.value = tab
    activeTab.value = 'receipt'
    // Clear after queued watchers have fired
    nextTick(() => {
      suppressTabToAccordion = false
      suppressHashActivation = false
    })
  }
})

// Accordion open → switch preview tab
watch(charityOpenAccordionId, (id) => {
  if (suppressAccordionToTab) return
  if (id === ACCORDION_IDS.charityDetails) activeTab.value = 'receipt'
  else if (id === ACCORDION_IDS.costs) activeTab.value = 'costs'
  else if (id === ACCORDION_IDS.terms) activeTab.value = 'terms'
})

// Preview tab → open corresponding accordion on form side
watch(activeTab, (tab) => {
  if (suppressTabToAccordion) return
  suppressAccordionToTab = true
  if (tab === 'receipt') charityOpenAccordionId.value = ACCORDION_IDS.charityDetails
  else if (tab === 'costs') charityOpenAccordionId.value = ACCORDION_IDS.costs
  else if (tab === 'terms') charityOpenAccordionId.value = ACCORDION_IDS.terms
  nextTick(() => {
    suppressAccordionToTab = false
  })
})

// Sync currency changes to form tab (only activate hash from preview-side changes)
watch(selectedCurrency, (currency) => {
  charityActiveTab.value = currency
  if (suppressHashActivation) return
  nextTick(() => {
    activateHashTarget(`charitySettings.currencyTabs.${currency}`)
  })
})

defineExpose({ activeTab })
</script>

<template>
  <PreviewEditable :enabled="editable">
    <Tabs v-model="activeTab">
      <TabsList class="w-full overflow-x-auto" data-preview-nav>
        <TabsTrigger value="receipt" class="text-xs">Receipt</TabsTrigger>
        <TabsTrigger value="costs" class="text-xs">Costs</TabsTrigger>
        <TabsTrigger value="terms" class="text-xs">Terms</TabsTrigger>
      </TabsList>

      <!-- Receipt tab -->
      <TabsContent value="receipt">
        <div class="space-y-3">
          <div :style="brandingStyle">
            <ReceiptPreview
              :currency="selectedCurrency"
              :external-targets="charityReceiptTargets"
            />
          </div>
          <div class="flex justify-between text-xs text-muted-foreground px-1">
            <span>Preview with charity details</span>
            <NuxtLink
              to="/admin/templates/receipts"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Receipt
              <ArrowRight class="size-3" />
            </NuxtLink>
          </div>
        </div>
      </TabsContent>

      <!-- Costs tab -->
      <TabsContent value="costs" :style="brandingStyle">
        <div class="space-y-4">
          <p class="text-xs text-muted-foreground">Card shown on donation form</p>
          <CoverCostsInfoCard :targets="costsTargets" />

          <p class="text-xs text-muted-foreground mt-4">Modal content</p>
          <div class="border rounded-lg p-6">
            <CoverCostsModalContent :targets="costsTargets" :show-heading="true" />
          </div>
        </div>
      </TabsContent>

      <!-- Terms tab -->
      <TabsContent value="terms" :style="brandingStyle">
        <div class="space-y-4">
          <p class="text-xs text-muted-foreground">Checkbox shown on donation form</p>
          <div class="border rounded-lg p-6" data-field="terms">
            <FormRenderer
              :key="termsPreviewKey"
              v-model="termsPreviewData"
              :section="termsPreviewSection"
              :validate-on-mount="false"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </PreviewEditable>
</template>
