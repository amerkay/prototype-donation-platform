<script setup lang="ts">
const LOGO_SIZES = {
  small: { height: '3rem', fallbackSize: '3.5rem', margin: '1rem' },
  medium: { height: '4rem', fallbackSize: '4.5rem', margin: '1.5rem' },
  large: { height: '5.5rem', fallbackSize: '6rem', margin: '2rem' }
} as const

const props = defineProps<{
  logoUrl: string
  primaryColor: string
  size: 'small' | 'medium' | 'large'
  dataField?: string
}>()

const sizeConfig = computed(() => LOGO_SIZES[props.size] ?? LOGO_SIZES.medium)
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
      fontSize: '1.5rem',
      backgroundColor: primaryColor
    }"
  >
    &#10022;
  </div>
</template>
