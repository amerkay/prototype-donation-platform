<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useElementVisibility, useMediaQuery } from '@vueuse/core'
import type FormRenderer from '~/features/_library/form-builder/FormRenderer.vue'

interface Props {
  /** Explicit disabled state (overrides form validation) */
  disabled?: boolean
  /** Optional form renderer refs to validate */
  formRefs?: Array<InstanceType<typeof FormRenderer> | null | undefined>
  /** Additional custom validation logic */
  customValid?: boolean
  /** Parent container ref to check if form is in viewport */
  parentContainerRef?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  formRefs: () => [],
  customValid: true,
  parentContainerRef: null
})

const emit = defineEmits<{
  click: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const isVisible = useElementVisibility(containerRef, { threshold: 0.8 })
const isParentVisible = useElementVisibility(() => props.parentContainerRef, { threshold: 0.1 })
const isMobile = useMediaQuery('(max-width: 768px)')

/**
 * Compute combined validation state from all form refs
 * All forms must be valid for button to be enabled
 */
const isValid = computed(() => {
  // Check explicit disabled prop first
  if (props.disabled) return false

  // Check custom validation
  if (!props.customValid) return false

  // If no form refs provided, rely on disabled and customValid
  if (!props.formRefs || props.formRefs.length === 0) return true

  // All forms must be valid
  return props.formRefs.every((formRef) => formRef?.isValid ?? false)
})

// Only float on mobile when button is not visible, parent IS visible, and button is enabled
const shouldFloat = computed(() => {
  return isMobile.value && !isVisible.value && isParentVisible.value && isValid.value
})

/**
 * Handle click - validate forms if invalid, otherwise emit click
 */
const handleClick = () => {
  // If already valid, proceed
  if (isValid.value) {
    emit('click')
    return
  }

  // Trigger validation on all invalid forms
  props.formRefs?.forEach((formRef) => {
    if (formRef && !formRef.isValid) {
      formRef.onSubmit()
    }
  })
}
</script>

<template>
  <div ref="containerRef" data-preview-nav class="relative">
    <!-- Spacer to prevent layout shift when button becomes fixed -->
    <div v-if="shouldFloat" class="h-18" />

    <div
      :class="[
        'transition-opacity duration-150',
        shouldFloat
          ? 'fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg'
          : 'relative'
      ]"
    >
      <Button
        :class="[
          'w-full h-12 text-base',
          !isValid && 'opacity-50 cursor-not-allowed pointer-events-auto'
        ]"
        @click="handleClick"
      >
        <slot>Next</slot>
      </Button>
    </div>
  </div>
</template>
