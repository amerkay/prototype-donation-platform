<script setup lang="ts">
import { ref, computed } from 'vue'
import { Minus, Plus } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import BaseDialogOrDrawer from '~/features/donation-form/donor/components/BaseDialogOrDrawer.vue'
import AmountSelector from '~/features/donation-form/donor/components/AmountSelector.vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import { createTributeFormSection } from '~/features/donation-form/features/tribute/donor/forms/tribute-form'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { DonationAmountsSettings } from '~/features/donation-form/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'
import type { CartItem } from '~/features/donation-form/features/impact-cart/donor/types'

interface Props {
  currency: string
  baseCurrency?: string
  donationAmountsConfig?: DonationAmountsSettings['frequencies']
  tributeConfig?: TributeSettings
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
    tribute?: TributeData
  ]
}>()

const { getCurrencySymbol, convertPrice } = useCurrency(() => props.baseCurrency)

// Internal state
const open = ref(false)
const product = ref<Product | null>(null)
const mode = ref<'add' | 'edit'>('add')
const localPrice = ref(0)
const localQuantity = ref(1)
const editingItemKey = ref<string | null>(null)
const tribute = ref<TributeData>({ type: 'none' })
const tributeFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const tributeFormKey = ref(0) // Key to force remount of tribute form

// Create form section from config
const formSection = computed(() => {
  if (!props.tributeConfig) return null
  return createTributeFormSection(props.tributeConfig)
})

// Computed
const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const isTributeFormValid = computed(() => {
  // If tribute feature is disabled, always valid
  if (!props.tributeConfig?.enabled) return true
  // If not recurring, tribute form doesn't apply
  if (!isRecurring.value) return true
  // If no tribute form ref yet, consider valid (initial state)
  if (!tributeFormRef.value) return true
  // Otherwise check the form's validity
  return tributeFormRef.value.isValid ?? false
})

const isRecurring = computed(
  () => product.value?.frequency === 'monthly' || product.value?.frequency === 'yearly'
)

const frequencyLabel = computed(() => {
  if (!product.value) return 'donation'
  if (product.value.frequency === 'monthly') return 'monthly donation'
  if (product.value.frequency === 'yearly') return 'yearly donation'
  return 'one-time donation'
})

const amounts = computed(() => {
  if (!product.value || !isRecurring.value) return []
  const frequency = product.value.frequency
  const config = props.donationAmountsConfig?.[frequency]
  if (!config?.presetAmounts) return []
  // Convert amounts but preserve PresetAmount structure
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
  tributeFormKey.value++ // Force remount
  open.value = true
}

const openForEdit = (item: CartItem, itemKey: string) => {
  product.value = item
  mode.value = 'edit'
  localPrice.value = item.price ?? 0
  localQuantity.value = item.quantity ?? 1
  editingItemKey.value = itemKey
  tribute.value = item.tribute ? JSON.parse(JSON.stringify(item.tribute)) : { type: 'none' }
  tributeFormKey.value++
  open.value = true
}

const handleClose = () => {
  open.value = false
}

const handleConfirm = () => {
  if (!product.value) return

  // If already valid, proceed
  if (isTributeFormValid.value) {
    emit(
      'confirm',
      product.value,
      localPrice.value,
      localQuantity.value,
      mode.value,
      editingItemKey.value || undefined,
      tribute.value
    )
    open.value = false
    return
  }

  // Trigger validation to show errors
  if (tributeFormRef.value) {
    tributeFormRef.value.onSubmit()
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
    :description="product?.description || ''"
    @update:open="open = $event"
  >
    <template #header>
      <div class="flex items-center gap-3 mb-2">
        <div class="text-4xl">{{ product?.thumbnail }}</div>
        <div class="flex-1 min-w-0 text-left">
          <h2 class="text-lg font-semibold">{{ product?.name }}</h2>
        </div>
      </div>
    </template>

    <template #content>
      <div class="space-y-4">
        <!-- One-time with quantity selector -->
        <div v-if="!isRecurring" class="space-y-3">
          <div class="rounded-lg bg-muted p-4 text-center">
            <p class="text-sm text-muted-foreground">One-time donation</p>
            <p class="text-3xl font-bold">{{ currencySymbol }}{{ product?.price }}</p>
          </div>
          <div class="space-y-3 py-3">
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
                :disabled="localQuantity >= 99"
                @click="localQuantity = Math.min(99, localQuantity + 1)"
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

        <!-- Tribute Form (only for recurring products) -->
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
          !isTributeFormValid && 'opacity-50 cursor-not-allowed pointer-events-auto'
        ]"
        @click="handleConfirm"
      >
        {{ mode === 'edit' ? 'Update' : 'Add to Cart' }}
      </Button>
      <Button variant="outline" class="flex-1 md:flex-1 h-12" @click="handleClose"> Cancel </Button>
    </template>
  </BaseDialogOrDrawer>
</template>
