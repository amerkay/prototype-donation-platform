<script setup lang="ts">
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createFormConfigSection } from '../donation-form/forms/donation-form-config-form'
import { createMultipleProductsConfigSection } from '../donation-form/impact-cart/forms/impact-cart-config-form'
import { createProductSelectorConfigSection } from '../donation-form/product-selector/forms/product-selector-config-form'
import { createImpactJourneyConfigSection } from '../donation-form/impact-journey/forms/impact-journey-config-form'
import { createCoverCostsConfigSection } from '../donation-form/cover-costs/forms/cover-costs-config-form'
import { createGiftAidConfigSection } from '../donation-form/gift-aid/forms/gift-aid-config-form'
import { createTributeConfigSection } from '../donation-form/tribute/forms/tribute-config-form'
import { createCustomFieldsConfigSection } from '../donation-form/custom-fields/forms/custom-fields-config-form'
import { useFormConfigStore } from '~/stores/formConfig'

// Get shared reactive config store - mutations propagate automatically
const store = useFormConfigStore()

// Create all config sections
const formSection = createFormConfigSection()
const impactCartSection = createMultipleProductsConfigSection()
const productSelectorSection = createProductSelectorConfigSection()
const impactJourneySection = createImpactJourneyConfigSection()
const coverCostsSection = createCoverCostsConfigSection()
const giftAidSection = createGiftAidConfigSection()
const tributeSection = createTributeConfigSection()
const customFieldsSection = createCustomFieldsConfigSection()
</script>

<template>
  <div v-if="store.formSettings" class="w-full mx-auto space-y-6">
    <!-- Form Settings (includes form, localization, pricing) -->
    <div class="config-section">
      <FormRenderer v-model="store.formSettings" :section="formSection" validate-on-mount />
    </div>

    <!-- Impact Journey -->
    <div v-if="store.impactJourney" class="config-section">
      <FormRenderer
        v-model="store.impactJourney"
        :section="impactJourneySection"
        validate-on-mount
      />
    </div>

    <!-- Multiple Products -->
    <div v-if="store.impactCart" class="config-section">
      <FormRenderer v-model="store.impactCart" :section="impactCartSection" validate-on-mount />
    </div>

    <!-- Product Selector -->
    <div v-if="store.productSelector" class="config-section">
      <FormRenderer
        v-model="store.productSelector"
        :section="productSelectorSection"
        validate-on-mount
      />
    </div>

    <!-- Cover Costs -->
    <div v-if="store.coverCosts" class="config-section">
      <FormRenderer v-model="store.coverCosts" :section="coverCostsSection" validate-on-mount />
    </div>

    <!-- Gift Aid -->
    <div v-if="store.giftAid" class="config-section">
      <FormRenderer v-model="store.giftAid" :section="giftAidSection" validate-on-mount />
    </div>

    <!-- Tribute Settings -->
    <div v-if="store.tribute" class="config-section">
      <FormRenderer v-model="store.tribute" :section="tributeSection" validate-on-mount />
    </div>

    <!-- Custom Fields -->
    <div v-if="store.customFields" class="config-section">
      <FormRenderer v-model="store.customFields" :section="customFieldsSection" validate-on-mount />
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border;
}
</style>
