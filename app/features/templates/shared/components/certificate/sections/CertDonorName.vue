<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  name: string
  fontFamily: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div :class="cn('w-full overflow-hidden', compact ? 'mb-2' : 'mb-6')">
    <p
      :data-field="dataField"
      class="cert-adaptive font-medium text-gray-700 m-0 text-center whitespace-nowrap"
      :data-min-font="compact ? '20' : '28'"
      :class="compact ? 'text-3xl' : 'text-5xl'"
      :style="{
        fontFamily: `'${fontFamily}', serif`
      }"
    >
      {{ name }}
    </p>
  </div>
</template>
