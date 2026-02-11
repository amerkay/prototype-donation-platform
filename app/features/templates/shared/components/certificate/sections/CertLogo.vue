<script setup lang="ts">
import { LOGO_SIZES } from '~/features/templates/shared/types'

const props = defineProps<{
  logoUrl: string
  primaryColor: string
  size: 'small' | 'medium' | 'large'
  compact?: boolean
  dataField?: string
}>()

const sizeConfig = computed(() => {
  const mode = props.compact ? 'landscape' : 'portrait'
  return LOGO_SIZES[mode][props.size] ?? LOGO_SIZES[mode].medium
})
</script>

<template>
  <img
    v-if="logoUrl"
    :data-field="dataField"
    :src="logoUrl"
    alt="Logo"
    class="mx-auto shrink-0 object-contain"
    :style="{
      marginBottom: sizeConfig.margin,
      height: sizeConfig.height,
      width: 'auto'
    }"
  />
  <div
    v-else
    :data-field="dataField"
    class="rounded-full mx-auto shrink-0 flex items-center justify-center text-white font-bold"
    :style="{
      width: sizeConfig.fallbackSize,
      height: sizeConfig.fallbackSize,
      marginBottom: sizeConfig.margin,
      fontSize: compact ? '1.25rem' : '1.5rem',
      backgroundColor: primaryColor
    }"
  >
    &#10022;
  </div>
</template>
