<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ArrowDown } from 'lucide-vue-next'
import FieldHelpText from '~/features/_library/form-builder/internal/FieldHelpText.vue'
import AmountSelector from '~/features/donation-form/donor/components/AmountSelector.vue'
import PreviewCurrencySelect from '~/features/_admin/components/PreviewCurrencySelect.vue'
import {
  useCurrency,
  getCurrencySymbol
} from '~/features/donation-form/shared/composables/useCurrency'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { currencyOpenAccordionId } from '~/features/settings/admin/forms/currency-settings-form'
import { activateHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'
import { useCampaigns } from '~/features/campaigns/shared/composables/useCampaigns'
import { useFormsStore } from '~/features/campaigns/shared/stores/forms'
import type { PresetAmount } from '~/features/donation-form/shared/types'

const currencyStore = useCurrencySettingsStore()
const { campaigns } = useCampaigns()
const formsStore = useFormsStore()

const baseCurrency = computed(() => currencyStore.defaultCurrency)
const { convertPrice, getMultiplier } = useCurrency(() => baseCurrency.value)

/** Non-base supported currencies for the dropdown */
const targetCurrencies = computed(() =>
  currencyStore.supportedCurrencies.filter((c) => c !== baseCurrency.value)
)

const selectedCurrency = ref(targetCurrencies.value[0] ?? baseCurrency.value)

// Reset selection when target currencies change
watch(targetCurrencies, (currencies) => {
  if (!currencies.includes(selectedCurrency.value)) {
    selectedCurrency.value = currencies[0] ?? baseCurrency.value
  }
})

// Sync accordion open → preview dropdown.
// The accordion ID is a full path (e.g. 'currencies.currencyTabs.multipliers.USD'),
// so extract the currency code from the last segment.
watch(currencyOpenAccordionId, (id) => {
  const currency = id?.split('.').pop()
  if (currency && targetCurrencies.value.includes(currency)) {
    selectedCurrency.value = currency
  }
})

function handlePreviewCurrencyChange(currency: string) {
  selectedCurrency.value = currency
  // Switch to multipliers tab and open the currency's accordion via hash navigation.
  // Opening the accordion will update currencyOpenAccordionId via the group state.
  nextTick(() => {
    activateHashTarget(`currencies.currencyTabs.multipliers.${currency}`)
  })
}

/** Find the most recently updated donation form whose baseDefaultCurrency matches org default */
const sourceForm = computed(() => {
  let best: {
    campaignName: string
    formName: string
    formLink: string
    presets: PresetAmount[]
  } | null = null
  let bestDate = ''

  for (const campaign of campaigns.value) {
    if (campaign.type === 'fundraiser') continue
    const forms = formsStore.getForms(campaign.id)
    for (const form of forms) {
      const da = form.config?.donationAmounts
      if (!da) continue
      if (form.config?.form?.formType === 'registration') continue
      if (da.baseDefaultCurrency !== baseCurrency.value) continue

      const firstFreq = Object.values(da.frequencies ?? {}).find(
        (f) => f.enabled && f.presetAmounts?.length > 0
      )
      if (!firstFreq) continue

      if (form.updatedAt > bestDate) {
        bestDate = form.updatedAt
        best = {
          campaignName: campaign.name,
          formName: form.name,
          formLink: `/admin/campaigns/${campaign.id}/forms/${form.id}/edit#presetAmounts`,
          presets: firstFreq.presetAmounts.slice(0, 6)
        }
      }
    }
  }
  return best
})

const baseAmounts = computed(() => sourceForm.value?.presets ?? [])

const convertedAmounts = computed<PresetAmount[]>(() =>
  baseAmounts.value.map((p) => ({
    ...p,
    amount: convertPrice(p.amount, selectedCurrency.value)
  }))
)

const hasTargetCurrencies = computed(() => targetCurrencies.value.length > 0)
const baseSymbol = computed(() => getCurrencySymbol(baseCurrency.value))
const targetSymbol = computed(() => getCurrencySymbol(selectedCurrency.value))

const multiplier = computed(() => getMultiplier(baseCurrency.value, selectedCurrency.value))
const formulaTooltip = computed(
  () =>
    `1 ${baseCurrency.value} × ${multiplier.value} = ${multiplier.value} ${selectedCurrency.value}`
)

const dummyAmount = ref(0)
</script>

<template>
  <div class="space-y-4">
    <template v-if="!sourceForm">
      <div class="text-muted-foreground py-8 text-center text-sm">
        No donation forms with preset amounts found.
      </div>
    </template>

    <template v-else>
      <!-- Base currency -->
      <div class="space-y-2">
        <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {{ baseCurrency }} ({{ baseSymbol }}) - Base
        </p>
        <div class="pointer-events-none [&>div>button:last-child]:hidden">
          <AmountSelector v-model="dummyAmount" :amounts="baseAmounts" :currency="baseCurrency" />
        </div>
      </div>

      <template v-if="hasTargetCurrencies">
        <!-- Arrow divider with currency selector -->
        <div class="flex items-center justify-center gap-2 py-1">
          <div class="bg-border h-px flex-1" />
          <div class="flex items-center gap-1.5">
            <ArrowDown class="text-muted-foreground h-3 w-3" />
            <PreviewCurrencySelect
              :model-value="selectedCurrency"
              :currencies="targetCurrencies"
              @update:model-value="handlePreviewCurrencyChange"
            />
          </div>
          <div class="bg-border h-px flex-1" />
        </div>

        <!-- Target currency -->
        <div class="space-y-2">
          <FieldHelpText icon-class="size-3">
            <template #trigger>
              <span class="text-xs font-medium uppercase tracking-wide">
                {{ selectedCurrency }} ({{ targetSymbol }}) - Converted
              </span>
            </template>
            {{ formulaTooltip }}
          </FieldHelpText>
          <div class="pointer-events-none [&>div>button:last-child]:hidden">
            <AmountSelector
              v-model="dummyAmount"
              :amounts="convertedAmounts"
              :currency="selectedCurrency"
            />
          </div>
        </div>
      </template>

      <p v-else class="text-muted-foreground py-2 text-center text-xs italic">
        Add more currencies to see conversion preview
      </p>

      <!-- Source context -->
      <div class="text-muted-foreground text-xs leading-relaxed">
        Showing presets from
        <span class="text-foreground font-medium">{{ sourceForm.campaignName }}</span>
        <span class="mx-0.5">&rsaquo;</span>
        <NuxtLink
          :to="sourceForm.formLink"
          class="text-foreground font-medium underline underline-offset-2 hover:text-primary"
        >
          {{ sourceForm.formName }}
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
