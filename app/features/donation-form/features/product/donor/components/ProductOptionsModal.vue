<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInjectedBrandingStyle } from '~/features/settings/admin/composables/useBrandingCssVars'
import { Minus, Plus, Package } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import BaseDialogOrDrawer from '~/components/BaseDialogOrDrawer.vue'
import AmountSelector from '~/features/donation-form/donor/components/AmountSelector.vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import { createTributeFormSection } from '~/features/donation-form/features/tribute/donor/forms/tribute-form'
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

interface Props {
  currency: string
  baseCurrency?: string
  donationAmountsConfig?: DonationAmountsSettings['frequencies']
  tributeConfig?: TributeSettings
  entryFieldsConfig?: EntryFieldsSettings
  maxQuantity?: number
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  donationAmountsConfig: () => ({
    once: {
      enabled: true,
      label: 'One-time',
      presetAmounts: [
        { amount: 10 },
        { amount: 25 },
        { amount: 50 },
        { amount: 100 },
        { amount: 250 },
        { amount: 500 }
      ],
      customAmount: { min: 5, max: 1000 }
    },
    monthly: {
      enabled: true,
      label: 'Monthly',
      presetAmounts: [
        { amount: 5 },
        { amount: 10 },
        { amount: 25 },
        { amount: 50 },
        { amount: 75 },
        { amount: 100 }
      ],
      customAmount: { min: 3, max: 500 }
    },
    yearly: {
      enabled: true,
      label: 'Yearly',
      presetAmounts: [
        { amount: 50 },
        { amount: 100 },
        { amount: 250 },
        { amount: 500 },
        { amount: 1000 }
      ],
      customAmount: { min: 25, max: 2000 }
    }
  })
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

const { getCurrencySymbol, convertPrice } = useCurrency(() => props.baseCurrency)
const { labels, isDonation } = useFormTypeLabels()
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
    options: formConfigStore.products.map((p) => ({ value: p.id, label: p.name }))
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
const localPrice = ref(0)
const localQuantity = ref(1)
const editingItemKey = ref<string | null>(null)
const tribute = ref<TributeData>({ type: 'none' })
const tributeFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const tributeFormKey = ref(0)

// Entry fields state
const entryData = ref<Record<string, unknown>>({})
const entryFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const entryFormKey = ref(0)

// Create tribute form section from config
const formSection = computed(() => {
  if (!props.tributeConfig) return null
  return createTributeFormSection(props.tributeConfig)
})

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

// Computed
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const isTributeFormValid = computed(() => {
  if (!props.tributeConfig?.enabled) return true
  if (!isRecurring.value) return true
  if (!tributeFormRef.value) return true
  return tributeFormRef.value.isValid ?? false
})

const isEntryFormValid = computed(() => {
  if (!hasEntryFields.value) return true
  if (!entryFormRef.value) return true
  return entryFormRef.value.isValid ?? false
})

const isRecurring = computed(
  () => product.value?.frequency === 'monthly' || product.value?.frequency === 'yearly'
)

const frequencyLabel = computed(() => {
  if (!product.value) return labels.value.frequencyLabel
  if (product.value.frequency === 'monthly') return `monthly ${labels.value.frequencyLabel}`
  if (product.value.frequency === 'yearly') return `yearly ${labels.value.frequencyLabel}`
  return `one-time ${labels.value.frequencyLabel}`
})

const priceLabel = computed(() => {
  if (!product.value) return ''
  if (isDonation.value) return 'One-time donation'
  const price = product.value.price ?? 0
  return price === 0 ? 'Free' : ''
})

const amounts = computed(() => {
  if (!product.value || !isRecurring.value) return []
  const frequency = product.value.frequency
  const config = props.donationAmountsConfig?.[frequency]
  if (!config?.presetAmounts) return []
  return config.presetAmounts.map((preset) => ({
    ...preset,
    amount: convertPrice(preset.amount, props.currency)
  }))
})

const maxPrice = computed(() => {
  if (!product.value) return 1000
  const frequency = product.value.frequency
  const config = props.donationAmountsConfig?.[frequency]
  return convertPrice(config?.customAmount?.max ?? 1000, props.currency)
})

// Methods
const openForAdd = (prod: Product, initialPrice: number) => {
  product.value = prod
  mode.value = 'add'
  localPrice.value = initialPrice
  localQuantity.value = 1
  editingItemKey.value = null
  tribute.value = { type: 'none' }
  tributeFormKey.value++
  // Initialize entry data with defaults from form-level config
  entryData.value =
    hasEntryFields.value && props.entryFieldsConfig?.fields.length
      ? extractCustomFieldDefaults(props.entryFieldsConfig.fields)
      : {}
  entryFormKey.value++
  open.value = true
}

const openForEdit = (item: CartItem, itemKey: string) => {
  product.value = item
  mode.value = 'edit'
  localPrice.value = item.price ?? 0
  localQuantity.value = isPerItemMode.value ? 1 : (item.quantity ?? 1)
  editingItemKey.value = itemKey
  tribute.value = item.tribute ? JSON.parse(JSON.stringify(item.tribute)) : { type: 'none' }
  tributeFormKey.value++
  // Restore entry data from cart item, defaults from form-level config
  entryData.value = item.entryData
    ? JSON.parse(JSON.stringify(item.entryData))
    : hasEntryFields.value && props.entryFieldsConfig?.fields.length
      ? extractCustomFieldDefaults(props.entryFieldsConfig.fields)
      : {}
  entryFormKey.value++
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const handleConfirm = () => {
  if (!product.value) return

  // Validate both tribute and entry forms
  if (isTributeFormValid.value && isEntryFormValid.value) {
    emit(
      'confirm',
      product.value,
      localPrice.value,
      localQuantity.value,
      mode.value,
      editingItemKey.value || undefined,
      tribute.value,
      hasEntryFields.value ? entryData.value : undefined
    )
    open.value = false
    return
  }

  // Trigger validation to show errors
  if (!isTributeFormValid.value && tributeFormRef.value) {
    tributeFormRef.value.onSubmit()
  }
  if (!isEntryFormValid.value && entryFormRef.value) {
    entryFormRef.value.onSubmit()
  }
}

const isFormValid = computed(() => isTributeFormValid.value && isEntryFormValid.value)

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
    :description="product?.description || ''"
    :content-style="brandingStyle"
    @update:open="open = $event"
  >
    <template #header>
      <div class="flex items-center gap-3 mb-2">
        <img
          v-if="product?.image"
          :src="product.image"
          :alt="product.name"
          class="w-12 h-12 rounded-md object-cover shrink-0"
        />
        <div
          v-else
          class="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0"
        >
          <Package class="size-6" />
        </div>
        <div class="flex-1 min-w-0 text-left">
          <h2 class="text-lg font-semibold">{{ product?.name }}</h2>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-4">
        <!-- One-time with quantity selector (hidden in per-item entry mode) -->
        <div v-if="!isRecurring" class="space-y-3">
          <div class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">
              {{ priceLabel || frequencyLabel }}
            </p>
            <p v-if="(product?.price ?? 0) > 0" class="text-3xl font-bold">
              {{ currencySymbol }}{{ product?.price }}
            </p>
            <p v-else class="text-3xl font-bold">Free</p>
          </div>
          <div v-if="!isPerItemMode" class="space-y-3 py-3">
            <label class="text-sm font-medium text-center block">Quantity</label>
            <div class="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                class="h-12 w-12 shrink-0 rounded-full"
                :disabled="localQuantity <= 1"
                @click="localQuantity = Math.max(1, localQuantity - 1)"
              >
                <Minus />
                <span class="sr-only">Decrease</span>
              </Button>
              <div class="flex-1 text-center min-w-20">
                <div class="text-5xl font-bold tracking-tighter">
                  {{ localQuantity }}
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                class="h-12 w-12 shrink-0 rounded-full"
                :disabled="localQuantity >= (props.maxQuantity ?? 99)"
                @click="localQuantity = Math.min(props.maxQuantity ?? 99, localQuantity + 1)"
              >
                <Plus />
                <span class="sr-only">Increase</span>
              </Button>
            </div>
          </div>
        </div>

        <!-- Recurring with or without preset amounts -->
        <AmountSelector
          v-else-if="isRecurring"
          v-model="localPrice"
          :amounts="amounts"
          :currency="currency"
          :min-price="product?.minPrice ?? 0"
          :max-price="maxPrice"
          :frequency-label="frequencyLabel"
          :frequency="product?.frequency ?? 'once'"
        />

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

        <!-- Tribute Form (only for recurring products when donation type) -->
        <div
          v-if="isRecurring && props.tributeConfig?.enabled && formSection"
          class="pt-4 border-t"
        >
          <FormRenderer
            :key="tributeFormKey"
            ref="tributeFormRef"
            v-model="tribute"
            :validate-on-mount="false"
            :section="formSection"
            @submit="handleConfirm"
          />
        </div>
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
