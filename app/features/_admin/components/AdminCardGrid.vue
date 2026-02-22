<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" :class="{ 'lg:grid-cols-2': compact }">
    <slot />
  </div>
</template>
