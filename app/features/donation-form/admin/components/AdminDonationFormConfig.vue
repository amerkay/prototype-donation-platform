<script setup lang="ts">
import FormRenderer from '@/features/_library/form-builder/FormRenderer.vue'
import { useDonationFormConfigForm } from '~/features/donation-form/admin/forms/donation-form-config-form'
import { useMultipleProductsConfigSection } from '~/features/donation-form/features/impact-cart/admin/forms/impact-cart-config-form'
import { useProductSelectorConfigSection } from '~/features/donation-form/features/product-selector/admin/forms/product-selector-config-form'
import { useImpactJourneyConfigSection } from '~/features/donation-form/features/impact-journey/admin/forms/impact-journey-config-form'
import { useCoverCostsConfigSection } from '~/features/donation-form/features/cover-costs/admin/forms/cover-costs-config-form'
import { useGiftAidConfigSection } from '~/features/donation-form/features/gift-aid/admin/forms/gift-aid-config-form'
import { useTributeConfigSection } from '~/features/donation-form/features/tribute/admin/forms/tribute-config-form'
import { createDonationCustomFieldsConfigSection } from '~/features/donation-form/features/custom-fields/admin/forms/donation-custom-fields-config-form'
import { useFormConfigStore } from '~/features/donation-form/shared/stores/formConfig'
import { useDonationFormContext } from '~/features/donation-form/donor/composables/useDonationFormContext'

// Get shared reactive config store - mutations propagate automatically
const store = useFormConfigStore()

// Get donation form context for custom fields
const { contextSchema: donationContextSchema } = useDonationFormContext()

// Create all config sections
const formSection = useDonationFormConfigForm
const impactCartSection = useMultipleProductsConfigSection
const productSelectorSection = useProductSelectorConfigSection
const impactJourneySection = useImpactJourneyConfigSection
const coverCostsSection = useCoverCostsConfigSection
const giftAidSection = useGiftAidConfigSection
const tributeSection = useTributeConfigSection
const customFieldsSection = createDonationCustomFieldsConfigSection(donationContextSchema)
</script>

<template>
  <div v-if="store.formSettings" class="w-full mx-auto space-y-6">
    <!-- Form Settings (includes form, localization, pricing) -->
    <div class="config-section">
      <FormRenderer v-model="store.formSettings" :section="formSection" update-only-when-valid />
    </div>

    <!-- Impact Journey -->
    <div v-if="store.impactJourney" class="config-section">
      <FormRenderer
        v-model="store.impactJourney"
        :section="impactJourneySection"
        update-only-when-valid
      />
    </div>

    <!-- Multiple Products -->
    <div v-if="store.impactCart" class="config-section">
      <FormRenderer
        v-model="store.impactCart"
        :section="impactCartSection"
        update-only-when-valid
      />
    </div>

    <!-- Product Selector -->
    <div v-if="store.productSelector" class="config-section">
      <FormRenderer
        v-model="store.productSelector"
        :section="productSelectorSection"
        update-only-when-valid
      />
    </div>

    <!-- Cover Costs -->
    <div v-if="store.coverCosts" class="config-section">
      <FormRenderer
        v-model="store.coverCosts"
        :section="coverCostsSection"
        update-only-when-valid
      />
    </div>

    <!-- Gift Aid -->
    <div v-if="store.giftAid" class="config-section">
      <FormRenderer v-model="store.giftAid" :section="giftAidSection" update-only-when-valid />
    </div>

    <!-- Tribute Settings -->
    <div v-if="store.tribute" class="config-section">
      <FormRenderer v-model="store.tribute" :section="tributeSection" update-only-when-valid />
    </div>

    <!-- Custom Fields -->
    <div v-if="store.customFields" class="config-section">
      <FormRenderer
        v-model="store.customFields"
        :section="customFieldsSection"
        :context-schema="donationContextSchema"
        update-only-when-valid
      />
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-6 sm:px-6 bg-muted/50 rounded-xl border;
}
</style>
