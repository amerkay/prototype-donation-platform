<script setup lang="ts">
import { cn } from '@/lib/utils'

// Height-based sizing for centered logos
const LOGO_SIZES_CENTER = {
  small: { height: '3rem', margin: '1rem' },
  medium: { height: '4rem', margin: '1.25rem' },
  large: { height: '5.5rem', margin: '1.5rem' }
} as const

// Width-based sizing for left-positioned logos
const LOGO_SIZES_LEFT = {
  small: { maxWidth: '4rem' },
  medium: { maxWidth: '5.5rem' },
  large: { maxWidth: '7rem' }
} as const

const props = defineProps<{
  logoUrl: string
  size: 'small' | 'medium' | 'large'
  position?: 'center' | 'left'
  dataField?: string
}>()

const centered = computed(() => props.position !== 'left')

const imageStyle = computed(() => {
  if (centered.value) {
    const config = LOGO_SIZES_CENTER[props.size] ?? LOGO_SIZES_CENTER.medium
    return {
      marginBottom: config.margin,
      height: config.height,
      width: 'auto'
    }
  }
  const config = LOGO_SIZES_LEFT[props.size] ?? LOGO_SIZES_LEFT.medium
  return {
    maxWidth: config.maxWidth,
    height: 'auto',
    width: '100%'
  }
})
</script>

<template>
  <img
    v-if="logoUrl"
    :data-field="dataField"
    :src="logoUrl"
    alt="Logo"
    :class="cn('shrink-0 object-contain', centered && 'mx-auto')"
    :style="imageStyle"
  />
</template>
