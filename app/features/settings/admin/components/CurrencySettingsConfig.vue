<script setup lang="ts">
import { computed, ref } from 'vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/campaigns/admin/components/StickyButtonGroup.vue'
import { useCurrencySettingsForm } from '~/features/settings/admin/forms/currency-settings-form'
import { useCurrencySettingsStore } from '~/features/settings/shared/stores/currencySettings'

const store = useCurrencySettingsStore()

// Form definition
const form = useCurrencySettingsForm

// Form ref for validation
const formRef = ref()

// Create v-model binding for the store
// NOTE: Must match form structure with 'currencies' field group
const modelValue = computed({
  get: () => ({
    currencies: {
      supportedCurrencies: store.supportedCurrencies
    }
  }),
  set: (value) => {
    if (value.currencies) {
      store.updateSettings(value.currencies)
    }
  }
})

// Emit for parent to handle save/discard
const emit = defineEmits<{
  save: []
  discard: []
}>()
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
      @save="emit('save')"
      @discard="emit('discard')"
    />
  </div>
</template>
