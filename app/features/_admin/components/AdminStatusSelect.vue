<script setup lang="ts">
import { getStatusColor, getStatusLabel } from '~/lib/statusColors'
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

const hasSelectableOptions = computed(() => {
  const disabledValues = new Set(props.disabledOptions?.map((o) => o.value))
  return props.options.some((o) => o.value !== props.modelValue && !disabledValues.has(o.value))
})

function getDisabledReason(value: string): string | undefined {
  return props.disabledOptions?.find((o) => o.value === value)?.reason
}

function handleChange(value: string | number | bigint | Record<string, unknown> | null) {
  if (typeof value === 'string') emit('update:modelValue', value)
}
</script>

<template>
  <!-- Static badge when no selectable options -->
  <span
    v-if="!hasSelectableOptions"
    :class="
      cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0 h-6 text-xs font-medium',
        statusColor.border,
        statusColor.text
      )
    "
  >
    <span :class="cn('size-1.5 shrink-0 rounded-full', statusColor.dot)" />
    {{ getStatusLabel(modelValue) }}
  </span>

  <!-- Dropdown when options are available -->
  <Select v-else :model-value="modelValue" @update:model-value="handleChange">
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
      <SelectValue :placeholder="modelValue" />
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
