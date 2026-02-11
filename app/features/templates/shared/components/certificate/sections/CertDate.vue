<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  date: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div :data-field="dataField" class="text-center">
    <p
      :class="
        cn('text-gray-500 uppercase tracking-wide m-0', compact ? 'text-sm mb-1' : 'text-base mb-2')
      "
    >
      Date
    </p>
    <p :class="cn('text-gray-700 m-0 whitespace-nowrap', compact ? 'text-lg' : 'text-xl')">
      {{ date }}
    </p>
  </div>
</template>
