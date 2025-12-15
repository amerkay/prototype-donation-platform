<script setup lang="ts">
import AdminConfigBuilder from './AdminConfigBuilder.vue'
import { createFormConfigSection } from '../donation-form/form-builder/form-config'
import { createMultipleProductsConfigSection } from '../donation-form/cart/form-builder/impact-cart-config'
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
    <AdminConfigBuilder
      :section="formSection"
      :model-value="{
        form: config.form,
        localization: config.localization,
        pricing: config.pricing
      }"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleFormUpdate"
    />

    <!-- Multiple Products -->
    <AdminConfigBuilder
      :section="impactCartSection"
      :model-value="{
        enabled: config.features.impactCart.enabled,
        settings: { initialDisplay: config.features.impactCart.initialDisplay }
      }"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleMultipleProductsUpdate"
    />

    <!-- Product Selector -->
    <AdminConfigBuilder
      :section="productSelectorSection"
      :model-value="config.features.productSelector"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleProductSelectorUpdate"
    />

    <!-- Rewards -->
    <AdminConfigBuilder
      :section="rewardsSection"
      :model-value="config.features.rewards"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleRewardsUpdate"
    />

    <!-- Shipping Notice -->
    <AdminConfigBuilder
      :section="shippingNoticeSection"
      :model-value="{
        showNotice: config.features.shippingNotice.showNotice,
        settings: { noticeText: config.features.shippingNotice.noticeText }
      }"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleShippingNoticeUpdate"
    />

    <!-- Tribute Settings -->
    <AdminConfigBuilder
      :section="tributeSection"
      :model-value="config.features.tribute"
      class="bg-muted/50 rounded-xl"
      @update:model-value="handleTributeUpdate"
    />

    <!-- Debug output -->
    <!-- <div class="mt-8 p-4 bg-muted rounded-lg">
      <h3 class="text-sm font-semibold mb-2">Current Config (Debug)</h3>
      <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(config, null, 2) }}</pre>
    </div> -->
  </div>
</template>
