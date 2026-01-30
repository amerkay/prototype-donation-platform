<script setup lang="ts">
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/campaigns/admin/components/StickyButtonGroup.vue'
import { useCurrencySettingsForm } from '~/features/settings/admin/forms/currency-settings-form'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useCurrencySettingsStore()
const isDev = import.meta.dev

// AUTO-MAPPING: No getData/setData needed! ✨
// Form metadata ($storePath) handles all mapping automatically
const { formRef, modelValue, form, expose } = useAdminConfigForm({
  store,
  form: useCurrencySettingsForm
})

defineEmits<{
  save: []
  discard: []
}>()
defineExpose(expose)
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <FormRenderer
      ref="formRef"
      v-model="modelValue"
      :section="form"
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

    <!-- Dev Mode: JSON Output -->
    <pre v-if="isDev" class="bg-muted/50 rounded-xl p-4 text-xs overflow-auto max-h-96 border">{{
      JSON.stringify(
        {
          supportedCurrencies: store.supportedCurrencies,
          defaultCurrency: store.defaultCurrency,
          currencyMultipliers: store.currencyMultipliers
        },
        null,
        2
      )
    }}</pre>
  </div>
</template>
