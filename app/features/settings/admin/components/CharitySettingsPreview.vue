<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ICON_FORWARD } from '~/lib/icons'
import ReceiptPreview from '~/features/templates/admin/components/ReceiptPreview.vue'
import PreviewEditable from '~/features/_admin/components/PreviewEditable.vue'
import CoverCostsInfoCard from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsInfoCard.vue'
import CoverCostsModalContent from '~/features/donation-form/features/cover-costs/donor/components/CoverCostsModalContent.vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import { defineForm } from '~/features/_library/form-builder/api'
import { createTermsAcceptanceField } from '~/features/donation-form/features/terms/donor/forms/terms-acceptance-field'
import { useBrandingCssVars } from '~/features/settings/admin/composables/useBrandingCssVars'
import { useCharitySettingsStore } from '~/features/settings/admin/stores/charitySettings'
import { charityOpenAccordionId } from '~/features/settings/admin/forms/charity-settings-form'
import { HASH_TARGET_PASSIVE_KEY } from '~/features/_library/form-builder/composables/useHashTarget'
import { usePreviewSync } from '~/features/_shared/composables/usePreviewSync'

withDefaults(
  defineProps<{
    editable?: boolean
  }>(),
  { editable: false }
)

// Prevent preview FormRenderers from stealing the global hash target activator
provide(HASH_TARGET_PASSIVE_KEY, true)

const { brandingStyle } = useBrandingCssVars()
const charityStore = useCharitySettingsStore()

const { activePreviewTab: activeTab, syncToAccordion } = usePreviewSync({
  accordionId: charityOpenAccordionId,
  mapping: {
    'charitySettings.charitySettings': 'receipt',
    'charitySettings.charityCosts': 'costs',
    'charitySettings.terms': 'terms'
  },
  defaultTab: 'receipt'
})

// --- Receipt targets (flat charity paths) ---

const charityReceiptTargets = {
  charityNotice: 'charitySettings.charitySettings',
  showPhone: 'charitySettings.charitySettings.phone',
  showWebsite: 'charitySettings.charitySettings.website',
  showLogo: 'branding.logo'
}

// --- Costs targets ---

const costsTargets = {
  heading: 'charityCosts.heading',
  introText: 'charityCosts.introText',
  outroText: 'charityCosts.outroText',
  costs: 'charityCosts.costs'
} as const

// --- Terms preview ---

const termsPreviewData = ref({ acceptTerms: false })
const termsSettings = computed(() => charityStore.terms?.settings)
const termsPreviewSection = computed(() => {
  const config = charityStore.terms?.settings
  return defineForm('termsPreview', () => createTermsAcceptanceField(undefined, config))
})

const termsPreviewKey = computed(
  () =>
    `${termsSettings.value?.label}-${termsSettings.value?.description}-${termsSettings.value?.mode}`
)

defineExpose({ activeTab })
</script>

<template>
  <PreviewEditable :enabled="editable">
    <Tabs :model-value="activeTab" @update:model-value="syncToAccordion">
      <TabsList class="w-full overflow-x-auto" data-preview-nav>
        <TabsTrigger value="receipt" class="text-xs">Receipt</TabsTrigger>
        <TabsTrigger value="costs" class="text-xs">Costs</TabsTrigger>
        <TabsTrigger value="terms" class="text-xs">Terms</TabsTrigger>
      </TabsList>

      <!-- Receipt tab -->
      <TabsContent value="receipt">
        <div class="space-y-3">
          <div :style="brandingStyle">
            <ReceiptPreview :external-targets="charityReceiptTargets" />
          </div>
          <div class="flex justify-between text-xs text-muted-foreground px-1">
            <span>Preview with charity details</span>
            <NuxtLink
              to="/admin/templates/receipts"
              class="flex items-center gap-1 text-primary hover:underline"
            >
              Edit Receipt
              <ICON_FORWARD class="size-3" />
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
