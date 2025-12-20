<script setup lang="ts">
import { computed, toRaw } from 'vue'
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createFormConfigSection } from '../donation-form/forms/donation-form-config'
import { createMultipleProductsConfigSection } from '../donation-form/impact-cart/forms/impact-cart-config'
import { createProductSelectorConfigSection } from '../donation-form/product-selector/forms/product-selector-config'
import { createRewardsConfigSection } from '../donation-form/rewards/forms/rewards-config'
import { createCoverCostsConfigSection } from '../donation-form/cover-costs/forms/cover-costs-config'
import { createTributeConfigSection } from '../donation-form/tribute/forms/tribute-config'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  config: FormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:config': [value: FormConfig]
}>()

// Use toRaw to unwrap reactive proxies and make nested arrays mutable
// Then deep clone to ensure complete mutability without reactive tracking
const formModelValue = computed(() => {
  const raw = {
    form: toRaw(props.config.form),
    localization: toRaw(props.config.localization),
    pricing: toRaw(props.config.pricing)
  }
  return JSON.parse(JSON.stringify(raw))
})

// Create all config sections
const formSection = createFormConfigSection()
const impactCartSection = createMultipleProductsConfigSection()
const productSelectorSection = createProductSelectorConfigSection()
const rewardsSection = createRewardsConfigSection()
const coverCostsSection = createCoverCostsConfigSection()
const tributeSection = createTributeConfigSection()

// Update handlers for each section
function handleFormUpdate(value: Record<string, unknown>) {
  emit('update:config', {
    ...props.config,
    form: value.form as FormConfig['form'],
    localization: value.localization as FormConfig['localization'],
    pricing: value.pricing as FormConfig['pricing']
  })
}

function handleMultipleProductsUpdate(value: Record<string, unknown>) {
  const { settings, ...rest } = value
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      impactCart: {
        ...rest,
        ...(settings as Record<string, unknown>)
      } as FormConfig['features']['impactCart']
    }
  })
}

function handleProductSelectorUpdate(value: Record<string, unknown>) {
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      productSelector: value as FormConfig['features']['productSelector']
    }
  })
}

function handleRewardsUpdate(value: Record<string, unknown>) {
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      rewards: value as FormConfig['features']['rewards']
    }
  })
}

function handleCoverCostsUpdate(value: Record<string, unknown>) {
  const { settings, ...rest } = value
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      coverCosts: {
        ...rest,
        ...(settings as Record<string, unknown>)
      } as FormConfig['features']['coverCosts']
    }
  })
}

function handleTributeUpdate(value: Record<string, unknown>) {
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      tribute: value as FormConfig['features']['tribute']
    }
  })
}
</script>

<template>
  <div class="w-full mx-auto space-y-6">
    <!-- Form Settings (includes form, localization, pricing) -->
    <div class="config-section">
      <FormRenderer
        :section="formSection"
        :model-value="formModelValue"
        @update:model-value="handleFormUpdate"
      />
    </div>

    <!-- Multiple Products -->
    <div class="config-section">
      <FormRenderer
        :section="impactCartSection"
        :model-value="{
          enabled: config.features.impactCart.enabled,
          settings: { initialDisplay: config.features.impactCart.initialDisplay }
        }"
        @update:model-value="handleMultipleProductsUpdate"
      />
    </div>

    <!-- Product Selector -->
    <div class="config-section">
      <FormRenderer
        :section="productSelectorSection"
        :model-value="config.features.productSelector"
        @update:model-value="handleProductSelectorUpdate"
      />
    </div>

    <!-- Rewards -->
    <div class="config-section">
      <FormRenderer
        :section="rewardsSection"
        :model-value="config.features.rewards"
        @update:model-value="handleRewardsUpdate"
      />
    </div>

    <!-- Cover Costs -->
    <div class="config-section">
      <FormRenderer
        :section="coverCostsSection"
        :model-value="{
          enabled: config.features.coverCosts.enabled,
          settings: {
            heading: config.features.coverCosts.heading,
            description: config.features.coverCosts.description
          }
        }"
        @update:model-value="handleCoverCostsUpdate"
      />
    </div>

    <!-- Tribute Settings -->
    <div class="config-section">
      <FormRenderer
        :section="tributeSection"
        :model-value="config.features.tribute"
        @update:model-value="handleTributeUpdate"
      />
    </div>

    <!-- Debug output -->
    <!-- <div class="mt-8 p-4 bg-muted rounded-lg">
      <h3 class="text-sm font-semibold mb-2">Current Config (Debug)</h3>
      <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(config, null, 2) }}</pre>
    </div> -->
  </div>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.config-section {
  @apply px-4 py-2 sm:px-6 bg-muted/50 rounded-xl border;
}
</style>
