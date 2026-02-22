<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight } from 'lucide-vue-next'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import PreviewCurrencySelect from '~/features/_admin/components/PreviewCurrencySelect.vue'
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
import { activateHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

const currencyStore = useCurrencySettingsStore()
const { brandingStyle } = useBrandingCssVars()
const charityStore = useCharitySettingsStore()

const activeTab = ref('receipt')
const selectedCurrency = ref(currencyStore.defaultCurrency)

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
  outroText: 'charityCosts.outroText'
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

// Form currency tab → preview currency + switch to receipt tab
watch(charityActiveTab, (tab) => {
  if (tab && currencyStore.supportedCurrencies.includes(tab)) {
    selectedCurrency.value = tab
    suppressTabToAccordion = true
    activeTab.value = 'receipt'
    suppressTabToAccordion = false
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
  suppressAccordionToTab = false
})

// Preview currency → form tab
function handleCurrencyChange(currency: string) {
  selectedCurrency.value = currency
  charityActiveTab.value = currency
  nextTick(() => {
    activateHashTarget(`charitySettings.currencyTabs.${currency}`)
  })
}
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-muted-foreground">Preview</span>
      <PreviewCurrencySelect
        :model-value="selectedCurrency"
        :currencies="currencyStore.supportedCurrencies"
        @update:model-value="handleCurrencyChange"
      />
    </div>

    <Tabs v-model="activeTab">
      <TabsList class="w-full overflow-x-auto">
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
      <TabsContent value="costs">
        <PreviewEditable :enabled="true" :style="brandingStyle">
          <div class="space-y-4">
            <p class="text-xs text-muted-foreground">Card shown on donation form</p>
            <CoverCostsInfoCard :targets="costsTargets" />

            <p class="text-xs text-muted-foreground mt-4">Modal content</p>
            <div class="border rounded-lg p-6">
              <CoverCostsModalContent :targets="costsTargets" :show-heading="true" />
            </div>
          </div>
        </PreviewEditable>
      </TabsContent>

      <!-- Terms tab -->
      <TabsContent value="terms">
        <PreviewEditable :enabled="true" :style="brandingStyle">
          <div class="space-y-4">
            <p class="text-xs text-muted-foreground">Checkbox shown on donation form</p>
            <div class="border rounded-lg p-6">
              <FormRenderer
                :key="termsPreviewKey"
                v-model="termsPreviewData"
                :section="termsPreviewSection"
                :validate-on-mount="false"
              />
            </div>
          </div>
        </PreviewEditable>
      </TabsContent>
    </Tabs>
  </div>
</template>
