<script setup lang="ts">
import { computed } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useCampaignConfigStore } from '~/features/campaigns/shared/stores/campaignConfig'
import { getCampaignCapabilities } from '~/features/campaigns/shared/utils/campaignCapabilities'
import ProductPickerList from '~/features/products/admin/components/ProductPickerList.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'

type FeatureKey = 'impactCart' | 'productSelector'

const props = defineProps<{
  featureKey: FeatureKey
}>()

const { products: allProducts } = useProducts()
const store = useCampaignConfigStore()
const fc = store.formConfig

/** Read/write products for the specific feature */
const formProducts = computed({
  get: (): Product[] => {
    if (props.featureKey === 'impactCart') return fc.impactCart?.products ?? []
    return fc.productSelector?.products ?? []
  },
  set: (v: Product[]) => {
    if (props.featureKey === 'impactCart' && fc.impactCart) {
      fc.impactCart = { ...fc.impactCart, products: v }
    } else if (props.featureKey === 'productSelector' && fc.productSelector) {
      fc.productSelector = { ...fc.productSelector, products: v }
    }
  }
})

const formProductIds = computed(() => new Set(formProducts.value.map((p) => p.id)))
const available = computed(() => allProducts.value.filter((p) => !formProductIds.value.has(p.id)))

const showQuantity = computed(
  () => props.featureKey === 'impactCart' && getCampaignCapabilities(store.type).allowsEntryFields
)

function handleAdd(productIds: string[]) {
  const toAdd = allProducts.value.filter((p) => productIds.includes(p.id))
  formProducts.value = [...formProducts.value, ...toAdd]
  store.markDirty()
}

function handleRemove(productId: string) {
  formProducts.value = formProducts.value.filter((p) => p.id !== productId)
  if (props.featureKey === 'impactCart' && fc.impactCart) {
    const qty = fc.impactCart.settings?.quantityRemaining
    if (qty && productId in qty) {
      const { [productId]: _, ...rest } = qty
      fc.impactCart = {
        ...fc.impactCart,
        settings: {
          ...fc.impactCart.settings,
          quantityRemaining: Object.keys(rest).length > 0 ? rest : undefined
        }
      }
    }
  }
  store.markDirty()
}

function getQty(productId: string): number | undefined {
  return fc.impactCart?.settings?.quantityRemaining?.[productId]
}

function setQty(productId: string, value: number | undefined) {
  if (!fc.impactCart) return
  const current = fc.impactCart.settings?.quantityRemaining ?? {}
  const updated =
    value === undefined || value < 0
      ? (() => {
          const { [productId]: _, ...rest } = current
          return Object.keys(rest).length > 0 ? rest : undefined
        })()
      : { ...current, [productId]: value }
  fc.impactCart = {
    ...fc.impactCart,
    settings: { ...fc.impactCart.settings, quantityRemaining: updated }
  }
  store.markDirty()
}

function handleUpdate(productId: string, value: number | undefined) {
  if (value === undefined || value === null || Number.isNaN(value) || value < 0) {
    setQty(productId, undefined)
  } else {
    setQty(productId, value)
  }
}
</script>

<template>
  <ProductPickerList
    :products="formProducts"
    :available="available"
    empty-label="No products added to this form."
    all-added-label="All products are already added."
    @add="handleAdd"
    @remove="handleRemove"
  >
    <template v-if="showQuantity" #item-below="{ product }">
      <div class="flex items-center gap-1.5 pl-11 pb-0.5 sm:hidden">
        <span class="text-xs text-muted-foreground">Remaining</span>
        <NumberField
          :model-value="getQty(product.id)"
          class="w-24"
          @update:model-value="handleUpdate(product.id, $event)"
        >
          <NumberFieldContent class="[&>[data-slot=input]]:h-6 [&>[data-slot=input]]:text-xs">
            <NumberFieldDecrement class="p-1.5" />
            <NumberFieldInput
              placeholder="∞"
              :class="getQty(product.id) === 0 ? 'text-destructive' : ''"
            />
            <NumberFieldIncrement class="p-1.5" />
          </NumberFieldContent>
        </NumberField>
      </div>
    </template>
    <template v-if="showQuantity" #item-actions="{ product }">
      <div class="hidden sm:flex items-center gap-1.5 shrink-0">
        <span class="text-xs text-muted-foreground">Remaining</span>
        <NumberField
          :model-value="getQty(product.id)"
          class="w-24"
          @update:model-value="handleUpdate(product.id, $event)"
        >
          <NumberFieldContent class="[&>[data-slot=input]]:h-6 [&>[data-slot=input]]:text-xs">
            <NumberFieldDecrement class="p-1.5" />
            <NumberFieldInput
              placeholder="∞"
              :class="getQty(product.id) === 0 ? 'text-destructive' : ''"
            />
            <NumberFieldIncrement class="p-1.5" />
          </NumberFieldContent>
        </NumberField>
      </div>
    </template>
  </ProductPickerList>
</template>
