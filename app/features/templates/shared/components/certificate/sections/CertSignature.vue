<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  name: string
  title: string
  fontFamily: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div :data-field="dataField" class="text-center shrink-0">
    <p
      :class="
        cn(
          'font-medium text-gray-700 m-0 whitespace-nowrap overflow-hidden text-ellipsis',
          compact ? 'text-4xl' : 'text-4xl'
        )
      "
      :style="{ fontFamily: `'${fontFamily}', sans-serif` }"
    >
      {{ name }}
    </p>
    <p
      :class="
        cn(
          'text-gray-500 m-0 whitespace-nowrap overflow-hidden text-ellipsis',
          compact ? 'text-base' : 'text-lg'
        )
      "
    >
      {{ title }}
    </p>
  </div>
</template>
