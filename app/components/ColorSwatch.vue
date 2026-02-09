<script setup lang="ts">
defineProps<{
  color: string
  size?: 'sm' | 'md' | 'lg'
}>()

const sizeClasses = {
  sm: 'size-3',
  md: 'size-3.5',
  lg: 'size-4'
}
</script>

<template>
  <span
    :class="[sizeClasses[size || 'md'], 'rounded-full border border-black/10 shrink-0']"
    :style="{ backgroundColor: color }"
  />
</template>
