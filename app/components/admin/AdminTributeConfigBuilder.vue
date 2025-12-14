<script setup lang="ts">
import { ref, computed } from 'vue'
import ConfigSection from '@/components/form-builder/ConfigSection.vue'
import { tributeConfigSection } from '@/lib/form-builder/sections/tribute-config'
import type { FormConfig } from '@/lib/common/types'

interface Props {
  modelValue: FormConfig['features']['tribute']
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: FormConfig['features']['tribute']]
}>()

const openSection = ref<string | null>('tribute')

// Extract the subset of tribute config that matches our schema
const tributeConfig = computed(() => ({
  enabled: props.modelValue.enabled,
  icons: props.modelValue.icons,
  types: props.modelValue.types,
  modal: props.modelValue.modal
}))

// Handle updates from ConfigSection
function handleTributeUpdate(value: typeof tributeConfig.value) {
  emit('update:modelValue', {
    ...props.modelValue,
    ...value
  })
}

// Watch for section open state
function handleOpenChange(sectionId: string, isOpen: boolean) {
  openSection.value = isOpen ? sectionId : null
}
</script>

<template>
  <div class="space-y-2">
    <ConfigSection
      :section="tributeConfigSection"
      :model-value="tributeConfig"
      :open="openSection === 'tribute'"
      @update:model-value="handleTributeUpdate"
      @update:open="(v) => handleOpenChange('tribute', v)"
    />
  </div>
</template>
