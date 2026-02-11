<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  text: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <p
    :data-field="dataField"
    :class="
      cn(
        'text-gray-500 text-center m-0 whitespace-nowrap overflow-hidden text-ellipsis w-full',
        compact ? 'text-sm mt-2' : 'text-base mt-4'
      )
    "
  >
    {{ text }}
  </p>
</template>
