<script setup lang="ts">
import { getStatusColor } from '~/lib/statusColors'
import { cn } from '@/lib/utils'
import FieldHelpText from '~/features/_library/form-builder/internal/FieldHelpText.vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const props = defineProps<{
  modelValue: string
  options: { value: string; label: string }[]
  /** Options that should appear disabled with a tooltip reason */
  disabledOptions?: { value: string; reason: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const statusColor = computed(() => getStatusColor(props.modelValue))

function getDisabledReason(value: string): string | undefined {
  return props.disabledOptions?.find((o) => o.value === value)?.reason
}

function handleChange(value: string | number | bigint | Record<string, unknown> | null) {
  if (typeof value === 'string') emit('update:modelValue', value)
}
</script>

<template>
  <Select :model-value="modelValue" @update:model-value="handleChange">
    <SelectTrigger
      :class="
        cn(
          'data-[size=default]:h-6 w-auto gap-1 rounded-full px-2 py-0 text-xs font-medium shadow-none',
          statusColor.border,
          statusColor.text
        )
      "
    >
      <span :class="cn('size-1.5 shrink-0 rounded-full', statusColor.dot)" />
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <template v-for="opt in options" :key="opt.value">
        <div v-if="getDisabledReason(opt.value)" class="flex items-center gap-2 px-2 py-1.5">
          <span :class="cn('size-1.5 shrink-0 rounded-full', getStatusColor(opt.value).dot)" />
          <FieldHelpText side="bottom" icon-class="size-3">
            <template #trigger>
              <span class="text-xs text-muted-foreground">{{ opt.label }}</span>
            </template>
            {{ getDisabledReason(opt.value) }}
          </FieldHelpText>
        </div>
        <SelectItem v-else :value="opt.value" class="text-xs">
          <span class="flex items-center gap-2">
            <span :class="cn('size-1.5 shrink-0 rounded-full', getStatusColor(opt.value).dot)" />
            {{ opt.label }}
          </span>
        </SelectItem>
      </template>
    </SelectContent>
  </Select>
</template>
