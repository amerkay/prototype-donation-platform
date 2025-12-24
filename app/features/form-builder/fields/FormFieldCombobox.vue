<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxViewport
} from 'reka-ui'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import type { ComboboxFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  modelValue?: string | number | (string | number)[]
  errors: string[]
  meta: ComboboxFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string | number | (string | number)[]]
}>()

const { formValues } = useFormBuilderContext()

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

const searchValue = ref('')
const isOpen = ref(false)

const searchPlaceholder = computed(() => props.meta.searchPlaceholder ?? 'Search...')

const notFoundText = computed(() => props.meta.notFoundText ?? 'No results found.')

// Resolve options (can be static array or function)
const resolvedOptions = computed(() => {
  if (typeof props.meta.options === 'function') {
    return props.meta.options(formValues.value)
  }
  return props.meta.options
})

// Filter options based on search
const filteredOptions = computed(() => {
  if (!searchValue.value.trim()) return resolvedOptions.value

  const query = searchValue.value.toLowerCase()
  return resolvedOptions.value.filter((opt) => opt.label.toLowerCase().includes(query))
})

// Handle single vs multiple selection
const modelValue = computed({
  get: () => {
    if (props.meta.multiple) {
      // Multiple mode: return array
      const val = props.modelValue
      return Array.isArray(val) ? val : []
    }
    // Single mode: return single value
    return props.modelValue
  },
  set: (value) => {
    emit('update:modelValue', value as string | number | (string | number)[])
  }
})

// Display text for selected values
const displayText = computed(() => {
  if (props.meta.multiple) {
    const selected = modelValue.value as Array<string | number>
    if (selected.length === 0) return ''
    return `${selected.length} selected`
  } else {
    const val = modelValue.value as string | number | undefined
    if (val === undefined || val === '') return ''
    const option = resolvedOptions.value.find((o) => o.value === val)
    return option?.label ?? ''
  }
})

// Selected values as badges (for multiple mode)
const selectedBadges = computed(() => {
  if (!props.meta.multiple) return []
  const selected = modelValue.value as Array<string | number>
  return resolvedOptions.value.filter((opt) => selected.includes(opt.value))
})

// Check if an option is selected
const isSelected = (value: string | number): boolean => {
  if (props.meta.multiple) {
    const selected = modelValue.value as Array<string | number>
    return selected.includes(value)
  } else {
    return modelValue.value === value
  }
}

// Handle selection toggle
const toggleSelection = (value: string | number) => {
  if (props.meta.multiple) {
    const selected = [...(modelValue.value as Array<string | number>)]
    const index = selected.indexOf(value)
    if (index > -1) {
      selected.splice(index, 1)
    } else {
      selected.push(value)
    }
    modelValue.value = selected
  } else {
    modelValue.value = value
  }
}

// Remove badge in multiple mode
const removeBadge = (value: string | number, event: Event) => {
  event.stopPropagation()
  if (props.meta.multiple) {
    const selected = [...(modelValue.value as Array<string | number>)]
    const index = selected.indexOf(value)
    if (index > -1) {
      selected.splice(index, 1)
      modelValue.value = selected
    }
  }
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps" :disable-label-for="true">
    <ComboboxRoot
      v-model="modelValue"
      v-model:open="isOpen"
      v-model:search-term="searchValue"
      :multiple="meta.multiple"
      :disabled="meta.disabled"
      class="relative"
    >
      <ComboboxAnchor
        class="inline-flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        :class="[
          meta.class,
          errors.length && 'border-destructive',
          meta.disabled && 'pointer-events-none'
        ]"
        @click="!meta.disabled && (isOpen = true)"
      >
        <div class="flex flex-1 flex-wrap gap-1 items-center min-w-0">
          <!-- Multiple selection badges -->
          <template v-if="meta.multiple && selectedBadges.length > 0">
            <Badge
              v-for="option in selectedBadges"
              :key="option.value"
              variant="secondary"
              class="text-xs last-of-type:mr-2"
            >
              {{ option.label }}
              <button
                type="button"
                class="ml-1 rounded-full hover:bg-muted-foreground/20 inline-flex items-center justify-center"
                @click="removeBadge(option.value, $event)"
              >
                <Icon name="lucide:x" class="h-3 w-3" />
              </button>
            </Badge>
          </template>

          <!-- Input for search -->
          <ComboboxInput
            :id="name"
            :placeholder="displayText || resolvedPlaceholder || searchPlaceholder"
            :autocomplete="meta.autocomplete"
            :aria-invalid="!!errors.length"
            :disabled="meta.disabled"
            class="flex-1 min-w-30 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
            @blur="onBlur"
            @focus="!meta.disabled && (isOpen = true)"
          />
        </div>

        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </ComboboxAnchor>

      <ComboboxContent
        position="popper"
        :side-offset="4"
        to="body"
        class="z-50 w-[--reka-combobox-trigger-width] rounded-lg border bg-popover shadow-md outline-none will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=bottom]:animate-slideUpAndFade"
        :style="{ width: 'var(--reka-combobox-trigger-width)' }"
      >
        <ComboboxViewport class="max-h-72 overflow-auto p-1">
          <!-- Options -->
          <template v-if="filteredOptions.length > 0">
            <ComboboxItem
              v-for="option in filteredOptions"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
              class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              @click="toggleSelection(option.value)"
            >
              <ComboboxItemIndicator
                v-if="isSelected(option.value)"
                class="absolute right-2 inline-flex items-center justify-center"
              >
                <Check class="h-4 w-4" />
              </ComboboxItemIndicator>

              <div class="flex flex-1 flex-col">
                <span class="font-medium">{{ option.label }}</span>
                <span v-if="option.description" class="text-xs text-muted-foreground">
                  {{ option.description }}
                </span>
              </div>
            </ComboboxItem>
          </template>

          <!-- Empty state -->
          <div v-else class="py-6 text-center text-sm text-muted-foreground">
            {{ notFoundText }}
          </div>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxRoot>
  </FormFieldWrapper>
</template>
