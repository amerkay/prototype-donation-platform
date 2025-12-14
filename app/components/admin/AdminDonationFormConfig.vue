<script setup lang="ts">
import AdminTributeConfigBuilder from './AdminTributeConfigBuilder.vue'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  config: FormConfig
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:config': [value: FormConfig]
}>()

// Handle tribute config updates
function handleTributeConfigUpdate(value: FormConfig['features']['tribute']) {
  emit('update:config', {
    ...props.config,
    features: {
      ...props.config.features,
      tribute: value
    }
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <AdminTributeConfigBuilder
      :model-value="config.features.tribute"
      @update:model-value="handleTributeConfigUpdate"
    />

    <!-- Debug output -->
    <div class="mt-8 p-4 bg-muted rounded-lg">
      <h3 class="text-sm font-semibold mb-2">Current Config (Debug)</h3>
      <pre class="text-xs overflow-auto max-h-96">{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>
