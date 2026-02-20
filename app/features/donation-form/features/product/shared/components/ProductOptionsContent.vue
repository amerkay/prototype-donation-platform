<script setup lang="ts">
import { ref, computed } from 'vue'
import { Minus, Plus, Package } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCurrency } from '~/features/donation-form/shared/composables/useCurrency'
import { useFormTypeLabels } from '~/features/donation-form/shared/composables/useFormTypeLabels'
import AmountSelector from '~/features/donation-form/donor/components/AmountSelector.vue'
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import { createTributeFormSection } from '~/features/donation-form/features/tribute/donor/forms/tribute-form'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import type { DonationAmountsSettings } from '~/features/donation-form/shared/types'
import type { TributeSettings } from '~/features/donation-form/features/tribute/admin/types'
import type { TributeData } from '~/features/donation-form/features/tribute/donor/types'

interface Props {
  product: Product
  currency: string
  baseCurrency?: string
  donationAmountsConfig?: DonationAmountsSettings['frequencies']
  tributeConfig?: TributeSettings
  maxQuantity?: number
  /** Hide quantity selector (used in per-item entry mode) */
  hideQuantity?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  baseCurrency: 'GBP',
  maxQuantity: 99,
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

const { getCurrencySymbol, convertPrice } = useCurrency(() => props.baseCurrency)
const { labels, isDonation } = useFormTypeLabels()

const localPrice = ref(props.product.default ?? props.product.price ?? 0)
const localQuantity = ref(1)
const tribute = ref<TributeData>({ type: 'none' })
const tributeFormRef = ref<InstanceType<typeof FormRenderer> | null>(null)
const tributeFormKey = ref(0)

const currencySymbol = computed(() => getCurrencySymbol(props.currency))

const isRecurring = computed(
  () => props.product.frequency === 'monthly' || props.product.frequency === 'yearly'
)

const frequencyLabel = computed(() => {
  if (props.product.frequency === 'monthly') return `monthly ${labels.value.frequencyLabel}`
  if (props.product.frequency === 'yearly') return `yearly ${labels.value.frequencyLabel}`
  return `one-time ${labels.value.frequencyLabel}`
})

const priceLabel = computed(() => {
  if (isDonation.value) return 'One-time donation'
  const price = props.product.price ?? 0
  return price === 0 ? 'Free' : ''
})

const amounts = computed(() => {
  if (!isRecurring.value) return []
  const config = props.donationAmountsConfig?.[props.product.frequency]
  if (!config?.presetAmounts) return []
  return config.presetAmounts.map((preset) => ({
    ...preset,
    amount: convertPrice(preset.amount, props.currency)
  }))
})

const maxPrice = computed(() => {
  const config = props.donationAmountsConfig?.[props.product.frequency]
  return convertPrice(config?.customAmount?.max ?? 1000, props.currency)
})

const formSection = computed(() => {
  if (!props.tributeConfig) return null
  return createTributeFormSection(props.tributeConfig)
})

const isTributeFormValid = computed(() => {
  if (!props.tributeConfig?.enabled) return true
  if (!isRecurring.value) return true
  if (!tributeFormRef.value) return true
  return tributeFormRef.value.isValid ?? false
})

function reset(price: number, quantity: number, tributeData?: TributeData) {
  localPrice.value = price
  localQuantity.value = quantity
  tribute.value = tributeData ?? { type: 'none' }
  tributeFormKey.value++
}

defineExpose({
  localPrice,
  localQuantity,
  tribute,
  tributeFormRef,
  isTributeFormValid,
  reset
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start gap-3">
      <img
        v-if="product.image"
        :src="product.image"
        :alt="product.title"
        class="w-12 h-12 rounded-md object-cover shrink-0"
        data-field="basic.image"
      />
      <div
        v-else
        class="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0"
        data-field="basic.image"
      >
        <Package class="size-6" />
      </div>
      <div class="flex-1 min-w-0 text-left">
        <h2 class="text-lg font-semibold -mt-1" data-field="basic.title">{{ product.title }}</h2>
        <p v-if="product.description" class="text-sm text-muted-foreground line-clamp-3" data-field="basic.description">
          {{ product.description }}
        </p>
      </div>
    </div>

    <!-- One-time: price + quantity -->
    <div v-if="!isRecurring" class="space-y-3" data-field="pricing">
      <div class="rounded-lg bg-muted p-4 text-center">
        <p class="text-sm text-muted-foreground">
          {{ priceLabel || frequencyLabel }}
        </p>
        <p v-if="(product.price ?? 0) > 0" class="text-3xl font-bold">
          {{ currencySymbol }}{{ product.price }}
        </p>
        <p v-else class="text-3xl font-bold">Free</p>
      </div>
      <div v-if="!hideQuantity" class="space-y-3 py-3">
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
            :disabled="localQuantity >= maxQuantity"
            @click="localQuantity = Math.min(maxQuantity, localQuantity + 1)"
          >
            <Plus />
            <span class="sr-only">Increase</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Recurring: amount selector -->
    <AmountSelector
      v-else
      v-model="localPrice"
      data-field="pricing"
      :amounts="amounts"
      :currency="currency"
      :min-price="product.minPrice ?? 0"
      :max-price="maxPrice"
      :frequency-label="frequencyLabel"
      :frequency="product.frequency"
    />

    <!-- Extra content slot (entry fields in modal mode) -->
    <slot />

    <!-- Tribute Form (recurring + enabled) -->
    <div v-if="isRecurring && tributeConfig?.enabled && formSection" class="pt-4 border-t">
      <FormRenderer
        :key="tributeFormKey"
        ref="tributeFormRef"
        v-model="tribute"
        :validate-on-mount="false"
        :section="formSection"
      />
    </div>
  </div>
</template>
