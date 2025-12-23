<script setup lang="ts">
import { computed, toRaw } from 'vue'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createFormConfigSection } from '../donation-form/forms/donation-form-config-form'
import { createMultipleProductsConfigSection } from '../donation-form/impact-cart/forms/impact-cart-config-form'
import { createProductSelectorConfigSection } from '../donation-form/product-selector/forms/product-selector-config-form'
import { createRewardsConfigSection } from '../donation-form/rewards/forms/rewards-config-form'
import { createCoverCostsConfigSection } from '../donation-form/cover-costs/forms/cover-costs-config-form'
import { createTributeConfigSection } from '../donation-form/tribute/forms/tribute-config-form'
import { useFormConfigStore } from '~/stores/formConfig'

// Get shared reactive config store - mutations propagate automatically
const store = useFormConfigStore()

// Create all config sections
const formSection = createFormConfigSection()
const impactCartSection = createMultipleProductsConfigSection()
const productSelectorSection = createProductSelectorConfigSection()
const rewardsSection = createRewardsConfigSection()
const coverCostsSection = createCoverCostsConfigSection()
const tributeSection = createTributeConfigSection()

// FormRenderer for 'form' section expects combined form, localization, pricing
// Use toRaw and deep clone to strip Pinia reactive proxies and make nested arrays mutable
const formModel = computed({
  get: () => {
    const raw = {
      form: toRaw(store.form),
      localization: toRaw(store.localization),
      pricing: toRaw(store.pricing)
    }
    // Deep clone to ensure nested arrays are mutable
    return JSON.parse(JSON.stringify(raw))
  },
  set: (value: Record<string, unknown>) => {
    if (value.form) store.form = value.form as typeof store.form
    if (value.localization) store.localization = value.localization as typeof store.localization
    if (value.pricing) store.pricing = value.pricing as typeof store.pricing
  }
})
</script>

<template>
  <div v-if="store.form" class="w-full mx-auto space-y-6">
    <!-- Form Settings (includes form, localization, pricing) -->
    <div class="config-section">
      <FormRenderer v-model="formModel" :section="formSection" />
    </div>

    <!-- Multiple Products -->
    <div v-if="store.impactCart" class="config-section">
      <FormRenderer v-model="store.impactCart" :section="impactCartSection" />
    </div>

    <!-- Product Selector -->
    <div v-if="store.productSelector" class="config-section">
      <FormRenderer v-model="store.productSelector" :section="productSelectorSection" />
    </div>

    <!-- Rewards -->
    <div v-if="store.rewards" class="config-section">
      <FormRenderer v-model="store.rewards" :section="rewardsSection" />
    </div>

    <!-- Cover Costs -->
    <div v-if="store.coverCosts" class="config-section">
      <FormRenderer v-model="store.coverCosts" :section="coverCostsSection" />
    </div>

    <!-- Tribute Settings -->
    <div v-if="store.tribute" class="config-section">
      <FormRenderer v-model="store.tribute" :section="tributeSection" />
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border;
}
</style>
