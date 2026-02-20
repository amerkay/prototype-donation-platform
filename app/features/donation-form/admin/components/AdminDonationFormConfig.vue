<script setup lang="ts">
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
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

const store = useFormConfigStore()
const { effectiveCurrencies } = useDonationCurrencies()

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
  </div>
</template>
