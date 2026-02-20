<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Button } from '@/components/ui/button'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import {
  useCustomFieldsForm,
  extractCustomFieldDefaults
} from '~/features/_library/custom-fields/utils'
import type { ContextSchema } from '~/features/_library/form-builder/conditions'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type {
  DonationAmountsSettings,
  EntryFieldsSettings
} from '~/features/donation-form/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useImpactCartStore } from '~/features/donation-form/features/impact-cart/donor/stores/impactCart'
import { useDonationFormStore } from '~/features/donation-form/donor/stores/donationForm'
import { useDonationCurrencies } from '~/features/donation-form/shared/composables/useDonationCurrencies'
import ProductOptionsContent from '~/features/donation-form/features/product/shared/components/ProductOptionsContent.vue'

interface Props {
  currency: string
  baseCurrency?: string
  donationAmountsConfig?: DonationAmountsSettings['frequencies']
  tributeConfig?: TributeSettings
  entryFieldsConfig?: EntryFieldsSettings
  maxQuantity?: number
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP'
})

const emit = defineEmits<{
  confirm: [
    product: Product,
    price: number,
    quantity: number,
    mode: 'add' | 'edit',
    itemKey?: string,
    tribute?: TributeData,
    entryData?: Record<string, unknown>
  ]
}>()

const { labels } = useFormTypeLabels()
const formConfigStore = useFormConfigStore()
const cartStore = useImpactCartStore()
const donationStore = useDonationFormStore()
const { effectiveCurrencies } = useDonationCurrencies()
const brandingStyle = useInjectedBrandingStyle()

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
  currency: props.currency
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

// Internal state
const open = ref(false)
const product = ref<Product | null>(null)
const mode = ref<'add' | 'edit'>('add')
const editingItemKey = ref<string | null>(null)
const contentRef = ref<InstanceType<typeof ProductOptionsContent> | null>(null)

// Entry fields state
const entryData = ref<Record<string, unknown>>({})
const entryFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const entryFormKey = ref(0)

// Entry fields from form-level config (per-item mode only — shared mode renders on Step 1)
const isPerItemMode = computed(
  () => props.entryFieldsConfig?.enabled && props.entryFieldsConfig.mode === 'per-item'
)
const hasEntryFields = computed(
  () => isPerItemMode.value && (props.entryFieldsConfig?.fields.length ?? 0) > 0
)
const entryFieldsFormSection = computed(() => {
  if (!hasEntryFields.value || !props.entryFieldsConfig?.fields.length) return null
  return useCustomFieldsForm(props.entryFieldsConfig.fields)
})

const isEntryFormValid = computed(() => {
  if (!hasEntryFields.value) return true
  if (!entryFormRef.value) return true
  return entryFormRef.value.isValid ?? false
})

const isFormValid = computed(
  () => (contentRef.value?.isTributeFormValid ?? true) && isEntryFormValid.value
)

// Methods
const openForAdd = (prod: Product, initialPrice: number) => {
  product.value = prod
  mode.value = 'add'
  editingItemKey.value = null
  // Initialize entry data with defaults from form-level config
  entryData.value =
    hasEntryFields.value && props.entryFieldsConfig?.fields.length
      ? extractCustomFieldDefaults(props.entryFieldsConfig.fields)
      : {}
  entryFormKey.value++
  open.value = true
  nextTick(() => contentRef.value?.reset(initialPrice, 1))
}

const openForEdit = (item: CartItem, itemKey: string) => {
  product.value = item
  mode.value = 'edit'
  editingItemKey.value = itemKey
  // Restore entry data from cart item, defaults from form-level config
  entryData.value = item.entryData
    ? JSON.parse(JSON.stringify(item.entryData))
    : hasEntryFields.value && props.entryFieldsConfig?.fields.length
      ? extractCustomFieldDefaults(props.entryFieldsConfig.fields)
      : {}
  entryFormKey.value++
  open.value = true
  const quantity = isPerItemMode.value ? 1 : (item.quantity ?? 1)
  const tributeData = item.tribute ? JSON.parse(JSON.stringify(item.tribute)) : undefined
  nextTick(() => contentRef.value?.reset(item.price ?? 0, quantity, tributeData))
}

const handleClose = () => {
  open.value = false
}

const handleConfirm = () => {
  if (!product.value || !contentRef.value) return

  // Validate both tribute and entry forms
  if (isFormValid.value) {
    emit(
      'confirm',
      product.value,
      contentRef.value.localPrice,
      contentRef.value.localQuantity,
      mode.value,
      editingItemKey.value || undefined,
      contentRef.value.tribute,
      hasEntryFields.value ? entryData.value : undefined
    )
    open.value = false
    return
  }

  // Trigger validation to show errors
  if (!contentRef.value.isTributeFormValid && contentRef.value.tributeFormRef) {
    contentRef.value.tributeFormRef.onSubmit()
  }
  if (!isEntryFormValid.value && entryFormRef.value) {
    entryFormRef.value.onSubmit()
  }
}

// Expose methods for parent component
defineExpose({
  openForAdd,
  openForEdit
})
</script>

<template>
  <BaseDialogOrDrawer
    :open="open"
    :dismissible="true"
    description=""
    :content-style="brandingStyle"
    @update:open="open = $event"
  >
    <template #content>
      <div v-if="product">
        <ProductOptionsContent
          ref="contentRef"
          :product="product"
          :currency="currency"
          :base-currency="baseCurrency"
          :donation-amounts-config="donationAmountsConfig"
          :tribute-config="tributeConfig"
          :max-quantity="maxQuantity ?? 99"
          :hide-quantity="!!isPerItemMode"
        >
          <!-- Entry Fields Form (per-product custom fields) -->
          <div v-if="hasEntryFields && entryFieldsFormSection" class="pt-4 border-t">
            <FormRenderer
              :key="entryFormKey"
              ref="entryFormRef"
              v-model="entryData"
              :validate-on-mount="false"
              :section="entryFieldsFormSection"
              :context="entryContext"
              :context-schema="entryContextSchema"
              @submit="handleConfirm"
            />
          </div>
        </ProductOptionsContent>
      </div>
    </template>

    <template #footer>
      <Button
        :class="[
          'flex-1 md:flex-1 h-12',
          !isFormValid && 'opacity-50 cursor-not-allowed pointer-events-auto'
        ]"
        @click="handleConfirm"
      >
        {{ mode === 'edit' ? labels.updateCartLabel : labels.addToCartLabel }}
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleClose"> Cancel </Button>
    </template>
  </BaseDialogOrDrawer>
</template>
