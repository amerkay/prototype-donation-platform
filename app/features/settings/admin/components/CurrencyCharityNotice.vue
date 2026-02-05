<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

defineProps<{
  visible?: boolean
}>()
</script>

<template>
  <p v-if="visible" class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
    <AlertTriangle class="size-3 shrink-0" />
    <span> Default currency changed. Check your charity details after saving. </span>
  </p>
</template>
