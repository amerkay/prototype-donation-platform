<script setup lang="ts">
defineProps<{
  data: unknown
}>()

const isDev = import.meta.dev
</script>

<template>
  <pre
    v-if="isDev"
    class="bg-muted/50 rounded-xl p-4 text-xs overflow-auto max-h-96 border whitespace-pre-wrap wrap-break-word"
    >{{ JSON.stringify(data, null, 2) }}</pre
  >
</template>
