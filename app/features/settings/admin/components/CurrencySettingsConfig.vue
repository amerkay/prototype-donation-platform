<script setup lang="ts">
import { ref, watch } from 'vue'
import FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'
import StickyButtonGroup from '~/features/_admin/components/StickyButtonGroup.vue'
import CurrencyCharityNotice from '~/features/settings/admin/components/CurrencyCharityNotice.vue'
import DevJsonPreview from '~/features/_admin/components/DevJsonPreview.vue'
import {
  useCurrencySettingsForm,
  currencyOpenAccordionId
} from '~/features/settings/admin/forms/currency-settings-form'
import { provideAccordionGroup } from '~/features/_library/form-builder/composables/useAccordionGroup'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import { useAdminConfigForm } from '~/features/_admin/composables/useAdminConfigForm'

const store = useCurrencySettingsStore()
provideAccordionGroup(currencyOpenAccordionId)

// Track whether default currency was changed to show charity notice
const initialDefaultCurrency = ref(store.defaultCurrency)
const defaultCurrencyChanged = ref(false)

watch(
  () => store.defaultCurrency,
  (newVal) => {
    defaultCurrencyChanged.value = newVal !== initialDefaultCurrency.value
  }
)

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

    <StickyButtonGroup
      :is-dirty="store.isDirty"
      :is-saving="store.isSaving"
      :is-valid="formRef?.isValid ?? false"
      @save="$emit('save')"
      @discard="$emit('discard')"
    >
      <template #notice>
        <CurrencyCharityNotice :visible="defaultCurrencyChanged" />
      </template>
    </StickyButtonGroup>

    <DevJsonPreview :data="store.$state" />
  </div>
</template>
