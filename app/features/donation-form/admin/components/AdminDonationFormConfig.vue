<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import CurrencyChangeDialog from '~/features/settings/admin/components/CurrencyChangeDialog.vue'
import { createAdminDonationFormMaster } from '~/features/donation-form/admin/forms/admin-donation-form-master'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import {
  useDonationFormContext,
  buildBaseContextSchema,
  buildEntryFieldSchemaEntries
} from '~/features/donation-form/donor/composables/useDonationFormContext'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { FrequencySettings } from '~/features/donation-form/shared/types'
import {
  useCurrency,
  getCurrencySymbol,
  type ConversionBreakdown
} from '~/features/donation-form/shared/composables/useCurrency'
import { convertFrequencyAmounts } from '~/features/settings/admin/composables/useCurrencyConversion'

const router = useRouter()
const store = useFormConfigStore()
const { effectiveCurrencies } = useDonationCurrencies()
const { convertPrice, getConversionBreakdown } = useCurrency()

// Donor-side schema (static, for FormRenderer contextSchema prop)
const { contextSchema: donationContextSchema } = useDonationFormContext()

// Admin-side resolver: reads entry fields from live form values for reactive conditions
const adminContextSchemaResolver = (rootValues: Record<string, unknown>): ContextSchema => {
  const currencies = effectiveCurrencies.value.supportedCurrencies
  const products = store.products.map((p) => ({ id: p.id, name: p.title }))
  const schema = buildBaseContextSchema(currencies, products)

  const featuresData = rootValues.features as Record<string, unknown> | undefined
  const entryFieldsData = featuresData?.entryFields as Record<string, unknown> | undefined
  const entryFieldsList = entryFieldsData?.fields

  if (Array.isArray(entryFieldsList)) {
    const fields = (entryFieldsList as Record<string, unknown>[])
      .filter((f) => f.type && f.id && f.label)
      .map((f) => ({
        type: f.type as string,
        id: f.id as string,
        label: f.label as string,
        options: Array.isArray(f.options) ? (f.options as string[]) : undefined
      }))
    Object.assign(schema, buildEntryFieldSchemaEntries(fields))
  }

  return schema
}

// AUTO-MAPPING: No getData/setData needed! ✨
// Form metadata ($storePath) handles nested features flattening automatically
const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: createAdminDonationFormMaster(adminContextSchemaResolver),
  contextSchema: donationContextSchema.value
})

// --- Base currency change: conversion dialog ---
const showCurrencyConvertDialog = ref(false)
const pendingOldCurrency = ref('')
const pendingNewCurrency = ref('')
const conversionBreakdown = ref<ConversionBreakdown | null>(null)

// Tracks which currency the current amounts are denominated in.
// Updated after convert/skip; reset on discard so reverting doesn't trigger the dialog.
const savedBaseDefaultCurrency = store.donationAmounts?.baseDefaultCurrency ?? ''
let amountsCurrency = savedBaseDefaultCurrency

// Find a sample amount from preset amounts for the breakdown preview
function findSampleAmount(): number {
  const da = modelValue.value?.donationAmounts as Record<string, unknown> | undefined
  if (!da?.frequencies) return 30
  const freqs = da.frequencies as Record<
    string,
    { enabled?: boolean; presetAmounts?: { amount: number }[] }
  >
  for (const freq of Object.values(freqs)) {
    if (freq.enabled && freq.presetAmounts?.length) {
      return freq.presetAmounts[0]!.amount
    }
  }
  return 30
}

const presetExamples = computed(() => {
  if (!pendingOldCurrency.value || !pendingNewCurrency.value) return []
  const da = modelValue.value?.donationAmounts as Record<string, unknown> | undefined
  if (!da?.frequencies) return []
  const freqs = da.frequencies as Record<
    string,
    { enabled?: boolean; label?: string; presetAmounts?: { amount: number }[] }
  >
  const fromSym = getCurrencySymbol(pendingOldCurrency.value)
  const toSym = getCurrencySymbol(pendingNewCurrency.value)
  const examples: Array<{ label: string; from: string; to: string }> = []
  for (const [, freq] of Object.entries(freqs)) {
    if (!freq.enabled || !freq.presetAmounts?.length) continue
    const amt = freq.presetAmounts[0]!.amount
    const converted = convertPrice(amt, pendingNewCurrency.value, pendingOldCurrency.value)
    examples.push({
      label: `${freq.label ?? 'Preset'} preset`,
      from: `${fromSym}${amt}`,
      to: `${toSym}${converted}`
    })
    if (examples.length >= 3) break
  }
  return examples
})

watch(
  () => {
    const cs = modelValue.value?.currencySettings as Record<string, unknown> | undefined
    return cs?.baseDefaultCurrency as string | undefined
  },
  (newVal, oldVal) => {
    if (!newVal || !oldVal || newVal === oldVal) return
    if (oldVal === amountsCurrency && newVal !== oldVal) {
      pendingOldCurrency.value = oldVal
      pendingNewCurrency.value = newVal
      conversionBreakdown.value = getConversionBreakdown(findSampleAmount(), newVal, oldVal)
      showCurrencyConvertDialog.value = true
    }
  },
  { flush: 'sync' }
)

function handleConvertAmounts() {
  showCurrencyConvertDialog.value = false
  const fromCurrency = pendingOldCurrency.value
  const toCurrency = pendingNewCurrency.value

  // Read current frequencies from form, deep clone, convert, write back
  const da = modelValue.value?.donationAmounts as Record<string, unknown> | undefined
  if (!da?.frequencies) return

  const frequencies = JSON.parse(JSON.stringify(da.frequencies)) as Record<
    string,
    FrequencySettings
  >
  convertFrequencyAmounts(frequencies, fromCurrency, toCurrency, convertPrice)

  // Write converted frequencies back via setFieldValue
  formRef.value?.setFieldValue('donationAmounts.frequencies', frequencies)
  amountsCurrency = toCurrency

  // Navigate to preset amounts so the user can see the converted values
  router.replace({ hash: '#presetAmounts' })
}

function handleSkipConvert() {
  showCurrencyConvertDialog.value = false
  amountsCurrency = pendingNewCurrency.value
}

const emit = defineEmits<{
  save: []
  discard: []
}>()

function handleDiscard() {
  amountsCurrency = savedBaseDefaultCurrency
  emit('discard')
}
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Single FormRenderer with all sections as collapsible groups -->
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
      :context-schema="donationContextSchema"
      validate-on-mount
      update-only-when-valid
    />

    <!-- Save/Discard Buttons -->
    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="handleDiscard"
    />

    <!-- Base currency change: convert preset amounts dialog -->
    <CurrencyChangeDialog
      :open="showCurrencyConvertDialog"
      title="Convert Preset Amounts?"
      :description="`Base currency changed from **${pendingOldCurrency}** to **${pendingNewCurrency}**. All preset amounts and custom ranges can be automatically converted.`"
      :from-currency="pendingOldCurrency"
      :to-currency="pendingNewCurrency"
      :breakdown="conversionBreakdown"
      :examples="presetExamples"
      confirm-label="Convert Amounts"
      @update:open="showCurrencyConvertDialog = $event"
      @confirm="handleConvertAmounts"
      @skip="handleSkipConvert"
    />
  </div>
</template>
