<script setup lang="ts">
import { computed } from 'vue'
import { useProducts } from '~/features/products/admin/composables/useProducts'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { FEATURE_FORM_TYPE_SUPPORT } from '~/features/donation-form/shared/types'
import ProductPickerList from '~/features/products/admin/components/ProductPickerList.vue'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'

const { products: allProducts } = useProducts()
const store = useFormConfigStore()

const formProducts = computed(() => store.products)

const formProductIds = computed(() => new Set(formProducts.value.map((p) => p.id)))
const available = computed(() => allProducts.value.filter((p) => !formProductIds.value.has(p.id)))

const showQuantity = computed(() => {
  const formType = store.form?.formType ?? 'donation'
  const entryTypes = FEATURE_FORM_TYPE_SUPPORT['entryFields']
  return !!entryTypes && entryTypes.includes(formType)
})

function handleAdd(productIds: string[]) {
  const toAdd = allProducts.value.filter((p) => productIds.includes(p.id))
  store.products = [...store.products, ...toAdd]
  store.markDirty()
}

function handleRemove(productId: string) {
  store.products = store.products.filter((p) => p.id !== productId)
  const qty = store.quantityRemaining
  if (qty && productId in qty) {
    const { [productId]: _, ...rest } = qty
    store.quantityRemaining = Object.keys(rest).length > 0 ? rest : undefined
  }
  store.markDirty()
}

function getQty(productId: string): number | undefined {
  return store.quantityRemaining?.[productId]
}

function setQty(productId: string, value: number | undefined) {
  const current = store.quantityRemaining ?? {}
  if (value === undefined || value < 0) {
    const { [productId]: _, ...rest } = current
    store.quantityRemaining = Object.keys(rest).length > 0 ? rest : undefined
  } else {
    store.quantityRemaining = { ...current, [productId]: value }
  }
  store.markDirty()
}

function handleUpdate(productId: string, value: number) {
  if (Number.isNaN(value)) {
    setQty(productId, undefined)
  } else {
    setQty(productId, Math.max(0, value))
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
          :min="0"
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
          :min="0"
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
