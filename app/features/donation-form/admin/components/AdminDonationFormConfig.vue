<script setup lang="ts">
import { ref, watch } from 'vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
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
  type ConversionBreakdown
} from '~/features/donation-form/shared/composables/useCurrency'
import { convertFrequencyAmounts } from '~/features/settings/admin/composables/useCurrencyConversion'
import CurrencyConversionBreakdown from '~/features/settings/admin/components/CurrencyConversionBreakdown.vue'

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

// Track previous baseDefaultCurrency to detect changes
let lastBaseDefaultCurrency = store.donationAmounts?.baseDefaultCurrency ?? ''

// Find a sample amount from preset amounts for the breakdown preview
function findSampleAmount(): number {
  const da = modelValue.value?.donationAmounts as Record<string, unknown> | undefined
  if (!da?.frequencies) return 30
  const freqs = da.frequencies as Record<string, { enabled?: boolean; presetAmounts?: { amount: number }[] }>
  for (const freq of Object.values(freqs)) {
    if (freq.enabled && freq.presetAmounts?.length) {
      return freq.presetAmounts[0]!.amount
    }
  }
  return 30
}

watch(
  () => {
    const da = modelValue.value?.donationAmounts as Record<string, unknown> | undefined
    return da?.baseDefaultCurrency as string | undefined
  },
  (newVal, oldVal) => {
    if (!newVal || !oldVal || newVal === oldVal) return
    if (oldVal === lastBaseDefaultCurrency && newVal !== oldVal) {
      pendingOldCurrency.value = oldVal
      pendingNewCurrency.value = newVal
      conversionBreakdown.value = getConversionBreakdown(findSampleAmount(), newVal, oldVal)
      showCurrencyConvertDialog.value = true
    }
  }
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
  lastBaseDefaultCurrency = toCurrency
}

function handleSkipConvert() {
  showCurrencyConvertDialog.value = false
  lastBaseDefaultCurrency = pendingNewCurrency.value
}

defineEmits<{
  save: []
  discard: []
}>()
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
      @discard="$emit('discard')"
    />

    <!-- Base currency change: convert preset amounts dialog -->
    <AlertDialog v-model:open="showCurrencyConvertDialog">
      <AlertDialogContent class="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Convert Preset Amounts?</AlertDialogTitle>
          <AlertDialogDescription as="div" class="space-y-3">
            <p>
              Base currency changed from
              <span class="font-medium">{{ pendingOldCurrency }}</span> to
              <span class="font-medium">{{ pendingNewCurrency }}</span>. All preset amounts and
              custom ranges can be automatically converted.
            </p>
            <CurrencyConversionBreakdown
              v-if="conversionBreakdown"
              :breakdown="conversionBreakdown"
              :from-currency="pendingOldCurrency"
              :to-currency="pendingNewCurrency"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="handleSkipConvert">Keep Current Values</AlertDialogCancel>
          <AlertDialogAction @click="handleConvertAmounts">Convert Amounts</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
