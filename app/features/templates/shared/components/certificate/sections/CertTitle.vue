<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  color: string
  compact?: boolean
  dataField?: string
}>()
</script>

<template>
  <div :class="cn('w-full overflow-hidden', compact ? 'mb-4' : 'mb-6')">
    <h2
      :data-field="dataField"
      :data-max-lines="compact ? '1' : '2'"
      :class="
        cn(
          'font-bold leading-tight tracking-wide m-0',
          compact ? 'text-5xl italic line-clamp-1' : 'text-6xl line-clamp-2'
        )
      "
      :style="{ color }"
    >
      {{ title }}
    </h2>
  </div>
</template>
