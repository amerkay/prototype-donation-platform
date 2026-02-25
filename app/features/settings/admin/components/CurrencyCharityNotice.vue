<script setup lang="ts">
import { ICON_WARNING } from '~/lib/icons'

defineProps<{
  visible?: boolean
}>()
</script>

<template>
  <p v-if="visible" class="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
    <ICON_WARNING class="size-3 shrink-0" />
    <span> Default currency changed. Check your charity details after saving. </span>
  </p>
</template>
