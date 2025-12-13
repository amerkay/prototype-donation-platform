<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { useElementVisibility, useMediaQuery } from '@vueuse/core'

interface Props {
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  click: []
}>()

const containerRef = ref<HTMLElement | null>(null)
const isVisible = useElementVisibility(containerRef, { threshold: 0.8 })
const isMobile = useMediaQuery('(max-width: 768px)')

// Only float on mobile when button is not visible and not disabled
const shouldFloat = computed(() => {
  return isMobile.value && !isVisible.value && !props.disabled
})

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div ref="containerRef" class="relative">
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
      <Button :disabled="disabled" class="w-full h-12 text-base" @click="handleClick">
        <slot>Next</slot>
      </Button>
    </div>
  </div>
</template>
