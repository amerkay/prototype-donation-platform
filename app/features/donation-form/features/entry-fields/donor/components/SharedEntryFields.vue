<script setup lang="ts">
import { ref, computed } from 'vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import {
  useCustomFieldsForm,
  extractCustomFieldDefaults
} from '~/features/_library/custom-fields/utils'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { EntryFieldsSettings } from '~/features/donation-form/shared/types'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'

interface Props {
  config: EntryFieldsSettings
  currency?: string
}

const props = defineProps<Props>()

const formConfigStore = useFormConfigStore()
const cartStore = useImpactCartStore()
const donationStore = useDonationFormStore()
const { effectiveCurrencies } = useDonationCurrencies()

const entryData = ref<Record<string, unknown>>(extractCustomFieldDefaults(props.config.fields))
const formRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const formKey = ref(0)

const formSection = computed(() => {
  if (!props.config.fields.length) return null
  return useCustomFieldsForm(props.config.fields)
})

const cartProducts = computed(() => [
  ...new Set([
    ...cartStore.multipleCart.map((item) => item.id),
    ...(donationStore.selectedProducts.monthly ? [donationStore.selectedProducts.monthly.id] : []),
    ...(donationStore.selectedProducts.yearly ? [donationStore.selectedProducts.yearly.id] : [])
  ])
])

const entryContext = computed(() => ({
  cartProducts: cartProducts.value,
  cartItemCount: cartStore.multipleCart.length,
  cartTotal: cartStore.multipleCartTotal,
  currency: props.currency ?? formConfigStore.donationAmounts?.baseDefaultCurrency ?? 'GBP'
}))

const entryContextSchema = computed<ContextSchema>(() => ({
  cartProducts: {
    label: 'Cart Has Product',
    type: 'array',
    description: 'Products currently in donor cart (all frequencies)',
    options: formConfigStore.products.map((p) => ({ value: p.id, label: p.title }))
  },
  cartItemCount: { label: 'Cart Item Count', type: 'number' },
  cartTotal: { label: 'Cart Total', type: 'number' },
  currency: {
    label: 'Currency',
    type: 'array',
    options: effectiveCurrencies.value.supportedCurrencies.map((code) => ({
      value: code,
      label: code
    }))
  }
}))

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
