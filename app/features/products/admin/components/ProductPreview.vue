<script setup lang="ts">
import { useProductStore } from '~/features/products/admin/stores/product'
import { useCurrencySettingsStore } from '~/features/settings/admin/stores/currencySettings'
import DonorProductCard from '~/features/donation-form/features/product/donor/components/ProductCard.vue'
import type { Product } from '~/features/donation-form/features/product/shared/types'

const store = useProductStore()
const currencyStore = useCurrencySettingsStore()

const previewProduct = computed<Product>(() => ({
  id: store.id ?? '',
  name: store.name || 'Untitled Product',
  description: store.description,
  frequency: store.frequency,
  price: store.price,
  minPrice: store.minPrice,
  default: store.default,
  image: store.image,
  isShippingRequired: store.isShippingRequired,
  certificateTemplateId: store.certificateTemplateId,
  certificateOverrideName: store.certificateOverrideName,
  certificateText: store.certificateText
}))
</script>

<template>
  <div class="space-y-2">
    <DonorProductCard
      :product="previewProduct"
      :currency="currencyStore.defaultCurrency"
      icon="lucide:plus"
    />
  </div>
</template>
