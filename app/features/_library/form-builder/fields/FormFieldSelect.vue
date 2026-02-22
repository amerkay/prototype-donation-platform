<script setup lang="ts">
import { computed, unref } from 'vue'
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption
} from '@/components/ui/native-select'
import type { FieldProps, FieldEmits, SelectFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import { useFormBuilderContext } from '~/features/_library/form-builder/composables/useFormBuilderContext'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'
import { cn } from '@/lib/utils'

type Props = FieldProps<string | number, SelectFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | number>>()

const { fieldContext } = useFormBuilderContext()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

// Resolve options (can be static array, function, or ComputedRef)
const resolvedOptions = computed(() => {
  const opts = props.meta.options
  // Handle ComputedRef
  if (opts && typeof opts === 'object' && 'value' in opts) {
    return unref(opts)
  }
  if (typeof opts === 'function') {
    return opts(fieldContext.value)
  }
  return opts
})

// Group options by their group property (if any have groups)
const hasGroups = computed(() => resolvedOptions.value.some((o) => o.group))

const groupedOptions = computed(() => {
  if (!hasGroups.value) return null
  const groups = new Map<string, typeof resolvedOptions.value>()
  const ungrouped: typeof resolvedOptions.value = []
  for (const opt of resolvedOptions.value) {
    if (opt.group) {
      const existing = groups.get(opt.group)
      if (existing) existing.push(opt)
      else groups.set(opt.group, [opt])
    } else {
      ungrouped.push(opt)
    }
  }
  return { ungrouped, groups }
})

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Placeholder selected — clear the field
    if (value === '' || value === undefined) {
      emit('update:modelValue', '')
      return
    }
    // Find the original option to preserve correct type
    const option = resolvedOptions.value.find(
      (o: { value: string | number }) => String(o.value) === String(value)
    )
    if (option) {
      emit('update:modelValue', option.value)
    }
  }
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <NativeSelect
      :id="id || name"
      v-model="selectValue"
      :autocomplete="meta.autocomplete"
      :aria-invalid="!!errors.length"
      :disabled="resolvedDisabled"
      :class="
        cn(
          'bg-background',
          !modelValue && resolvedPlaceholder && 'text-muted-foreground',
          resolvedClass
        )
      "
      @blur="onBlur"
    >
      <NativeSelectOption v-if="resolvedPlaceholder" value="">
        {{ resolvedPlaceholder }}
      </NativeSelectOption>

      <!-- Grouped options -->
      <template v-if="groupedOptions">
        <NativeSelectOption
          v-for="opt in groupedOptions.ungrouped"
          :key="opt.value"
          :value="String(opt.value)"
        >
          {{ opt.label }}
        </NativeSelectOption>
        <NativeSelectOptGroup
          v-for="[groupName, opts] in groupedOptions.groups"
          :key="groupName"
          :label="groupName"
        >
          <NativeSelectOption v-for="opt in opts" :key="opt.value" :value="String(opt.value)">
            {{ opt.label }}
          </NativeSelectOption>
        </NativeSelectOptGroup>
      </template>

      <!-- Flat options -->
      <template v-else>
        <NativeSelectOption
          v-for="option in resolvedOptions"
          :key="option.value"
          :value="String(option.value)"
        >
          {{ option.label }}
        </NativeSelectOption>
      </template>
    </NativeSelect>
  </FormFieldWrapper>
</template>
