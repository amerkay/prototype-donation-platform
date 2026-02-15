<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

defineProps<{
  filters: Array<{ value: string; label: string }>
  modelValue: string
  counts?: Record<string, number>
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Button
      v-for="filter in filters"
      :key="filter.value"
      :variant="modelValue === filter.value ? 'default' : 'outline'"
      size="sm"
      @click="$emit('update:modelValue', filter.value)"
    >
      {{ filter.label }}
      <Badge
        v-if="counts && counts[filter.value] != null"
        variant="secondary"
        class="ml-1.5 px-1.5 min-w-5 justify-center"
      >
        {{ counts[filter.value] }}
      </Badge>
    </Button>
  </div>
</template>
