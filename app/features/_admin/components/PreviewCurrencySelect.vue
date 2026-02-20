<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

defineProps<{
  modelValue: string
  currencies: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <Select
    v-if="currencies.length > 1"
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event as string)"
  >
    <SelectTrigger class="h-8! w-20 text-xs">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="c in currencies" :key="c" :value="c" class="text-xs">
        {{ c }}
      </SelectItem>
    </SelectContent>
  </Select>
  <span v-else class="text-muted-foreground text-xs">{{ modelValue }}</span>
</template>
