<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  subtitleHtml: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div
    :data-field="dataField"
    :class="
      cn(
        'cert-subtitle w-full line-clamp-2 text-gray-700',
        compact ? 'text-xl mb-4' : 'text-2xl mb-6'
      )
    "
    v-html="subtitleHtml"
  />
  <!-- eslint-disable vue/no-v-html -- pre-sanitized rich text -->
</template>

<style scoped>
.cert-subtitle :deep(p) {
  margin: 0;
}
.cert-subtitle :deep(p + p) {
  margin-top: 0.25em;
}
.cert-subtitle :deep(a) {
  color: inherit;
  text-decoration: underline;
}
</style>
