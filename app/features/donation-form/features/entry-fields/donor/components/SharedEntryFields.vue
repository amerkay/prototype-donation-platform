<script setup lang="ts">
import { ref, computed } from 'vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import {
  useCustomFieldsForm,
  extractCustomFieldDefaults
} from '~/features/_library/custom-fields/utils'
import type { EntryFieldsSettings } from '~/features/donation-form/shared/types'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useEntryFieldsContext } from '~/features/donation-form/donor/composables/useEntryFieldsContext'

interface Props {
  config: EntryFieldsSettings
  currency?: string
}

const props = defineProps<Props>()

const formConfigStore = useFormConfigStore()

const entryData = ref<Record<string, unknown>>(extractCustomFieldDefaults(props.config.fields))
const formRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const formKey = ref(0)

const formSection = computed(() => {
  if (!props.config.fields.length) return null
  return useCustomFieldsForm(props.config.fields)
})

const { entryContext, entryContextSchema } = useEntryFieldsContext(
  () => props.currency ?? formConfigStore.donationAmounts?.baseDefaultCurrency ?? 'GBP'
)

const isValid = computed(() => {
  if (!formRef.value) return true
  return formRef.value.isValid ?? false
})

defineExpose({
  isValid,
  entryData
})
</script>

<template>
  <div v-if="formSection" class="pt-4 border-t">
    <FormRenderer
      :key="formKey"
      ref="formRef"
      v-model="entryData"
      :validate-on-mount="false"
      :section="formSection"
      :context="entryContext"
      :context-schema="entryContextSchema"
    />
  </div>
</template>
