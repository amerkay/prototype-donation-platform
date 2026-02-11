<script setup lang="ts">
import { cn } from '@/lib/utils'

const props = defineProps<{
  color: string
  thickness: string
  compact?: boolean
}>()

const width = computed(() => (props.compact ? '8rem' : '10rem'))
</script>

<template>
  <div
    :class="cn('shrink-0', compact ? 'my-2' : 'my-8')"
    :style="{
      width,
      height: thickness,
      margin: compact ? '0.75rem auto 0.5rem' : '0 auto 2rem',
      backgroundColor: color
    }"
  />
</template>
