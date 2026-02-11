<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  bodyHtml: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div
    :data-field="dataField"
    :class="
      cn(
        'cert-body w-full max-w-[95%] mx-auto line-clamp-2 text-gray-700 text-center leading-relaxed',
        compact ? 'text-lg' : 'text-xl mb-6'
      )
    "
    v-html="bodyHtml"
  />
  <!-- eslint-disable vue/no-v-html -- pre-sanitized rich text -->
</template>

<style scoped>
.cert-body :deep(p) {
  margin: 0;
}
.cert-body :deep(p + p) {
  margin-top: 0.5em;
}
.cert-body :deep(a) {
  color: inherit;
  text-decoration: underline;
}
</style>
