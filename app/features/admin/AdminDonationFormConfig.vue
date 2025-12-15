<script setup lang="ts">
import FormRenderer from '@/features/form-builder/FormRenderer.vue'
import { createFormConfigSection } from '../donation-form/form-builder/form-config'
import { createMultipleProductsConfigSection } from '../donation-form/impact-cart/form-builder/impact-cart-config'
import { createProductSelectorConfigSection } from '../donation-form/product-selector/form-builder/product-selector-config'
import { createRewardsConfigSection } from '../donation-form/rewards/form-builder/rewards-config'
import { createShippingNoticeConfigSection } from '../donation-form/shipping-notice/form-builder/shipping-notice-config'
import { createTributeConfigSection } from '../donation-form/tribute/form-builder/tribute-config'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  config: FormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:config': [value: FormConfig]
}>()

// Create all config sections
const formSection = createFormConfigSection()
const impactCartSection = createMultipleProductsConfigSection()
const productSelectorSection = createProductSelectorConfigSection()
const rewardsSection = createRewardsConfigSection()
const shippingNoticeSection = createShippingNoticeConfigSection()
const tributeSection = createTributeConfigSection()

// Update handlers for each section
function handleFormUpdate(value: Record<string, unknown>) {
  const form = value.form as FormConfig['form']
  const localization = value.localization as FormConfig['localization']
  const pricing = value.pricing as FormConfig['pricing']

  emit('update:config', {
    ...props.config,
    form,
    localization,
    pricing
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

function handleShippingNoticeUpdate(value: Record<string, unknown>) {
  const { settings, ...rest } = value
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      shippingNotice: {
        ...rest,
        ...(settings as Record<string, unknown>)
      } as FormConfig['features']['shippingNotice']
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
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Form Settings (includes form, localization, pricing) -->
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
      <FormRenderer
        :section="formSection"
        :model-value="{
          form: config.form,
          localization: config.localization,
          pricing: config.pricing
        }"
        @update:model-value="handleFormUpdate"
      />
    </div>

    <!-- Multiple Products -->
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
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
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
      <FormRenderer
        :section="productSelectorSection"
        :model-value="config.features.productSelector"
        @update:model-value="handleProductSelectorUpdate"
      />
    </div>

    <!-- Rewards -->
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
      <FormRenderer
        :section="rewardsSection"
        :model-value="config.features.rewards"
        @update:model-value="handleRewardsUpdate"
      />
    </div>

    <!-- Shipping Notice -->
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
      <FormRenderer
        :section="shippingNoticeSection"
        :model-value="{
          showNotice: config.features.shippingNotice.showNotice,
          settings: { noticeText: config.features.shippingNotice.noticeText }
        }"
        @update:model-value="handleShippingNoticeUpdate"
      />
    </div>

    <!-- Tribute Settings -->
    <div class="px-6 py-2 bg-muted/50 rounded-xl">
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
