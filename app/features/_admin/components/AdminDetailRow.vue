<script setup lang="ts">
defineProps<{
  label: string
  value?: string
  valueClass?: string
}>()
</script>

<template>
  <div class="flex justify-between">
    <span class="text-muted-foreground">{{ label }}</span>
    <slot>
      <span :class="valueClass">{{ value }}</span>
    </slot>
  </div>
</template>
