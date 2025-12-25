<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxRoot,
  ComboboxViewport
} from 'reka-ui'
import { Spinner } from '@/components/ui/spinner'
import { Check } from 'lucide-vue-next'
import type {
  AutocompleteFieldMeta,
  AutocompleteOption,
  SetFieldValueFn,
  FieldProps,
  FieldEmits
} from '~/features/form-builder/types'
import { joinPath } from '~/features/form-builder/composables/useFieldPath'
import { useFormBuilderContext } from '~/features/form-builder/composables/useFormBuilderContext'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props extends FieldProps<AutocompleteOption | null, AutocompleteFieldMeta> {
  fieldPrefix?: string
}

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<AutocompleteOption | null>>()

// Inject form values and setFieldValue from context
// Note: If inside a field-group, formValues are already scoped to the group
const { formValues } = useFormBuilderContext()
const setFieldValue = inject<SetFieldValueFn>('setFieldValue', () => {})

// Component state
const searchValue = ref('')
const selectedValue = ref<AutocompleteOption | null>(null)
const options = ref<AutocompleteOption[]>([])
const isLoading = ref(false)

// Initialize selected value from modelValue if present
if (props.modelValue) {
  selectedValue.value = props.modelValue
}

const { wrapperProps, resolvedPlaceholder } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

// Configuration computed values
const minQueryLength = computed(() => props.meta.minQueryLength ?? 3)
const debounceMs = computed(() => props.meta.debounceMs ?? 300)

// Fetch options (async or static)
const fetchOptions = async (query: string) => {
  const trimmed = query.trim()

  // Check minimum length
  if (trimmed.length < minQueryLength.value) {
    options.value = []
    return
  }

  isLoading.value = true

  try {
    if (props.meta.fetchOptions) {
      // Async mode - fetch from API
      const results = await props.meta.fetchOptions(trimmed, formValues.value)
      options.value = results
    } else if (props.meta.options) {
      // Static mode - filter locally
      const lowerQuery = trimmed.toLowerCase()
      options.value = props.meta.options.filter((opt) =>
        opt.label.toLowerCase().includes(lowerQuery)
      )
    } else {
      options.value = []
    }
  } catch (error) {
    console.error('Error fetching autocomplete options:', error)
    options.value = []
  } finally {
    isLoading.value = false
  }
}

// Debounced search - use computed to get fresh debounce value
const debouncedSearch = useDebounceFn((query: string) => {
  fetchOptions(query)
}, debounceMs)

// Watch searchValue for changes - trigger API call
watch(searchValue, (newValue) => {
  if (newValue.trim().length >= minQueryLength.value) {
    debouncedSearch(newValue)
  } else {
    options.value = []
  }
})

// Watch for external modelValue changes (form resets, etc.)
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      selectedValue.value = null
      searchValue.value = ''
    } else {
      selectedValue.value = newValue
    }
  }
)

// Handle selection change from ComboboxRoot
const handleValueChange = (value: AutocompleteOption | null) => {
  if (!value) return

  selectedValue.value = value

  // Update field value via emit
  emit('update:modelValue', value)

  // Call meta.onChange if provided (for address autocomplete population)
  if (props.meta.onChange) {
    // Create a scoped setFieldValue that works with relative paths
    // Prepends fieldPrefix to convert relative paths to absolute paths
    const scopedSetFieldValue: SetFieldValueFn = (relativePath, val) => {
      const absolutePath = joinPath(props.fieldPrefix, relativePath)
      setFieldValue(absolutePath, val)
    }

    props.meta.onChange(value, formValues.value, scopedSetFieldValue)
  }

  // Clear search after selection
  searchValue.value = ''
}

// Handle input changes
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchValue.value = target.value
}

// Handle blur
const handleBlur = () => {
  props.onBlur?.(new Event('blur'))
}

// Additional config values with defaults
const notFoundText = computed(() => props.meta.notFoundText ?? 'No results found.')
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <ComboboxRoot
      v-model="selectedValue"
      ignore-filter
      class="relative"
      @update:model-value="handleValueChange"
    >
      <ComboboxAnchor
        class="inline-flex w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        :class="[meta.class, errors.length && 'border-destructive']"
      >
        <ComboboxInput
          :id="name"
          :placeholder="resolvedPlaceholder"
          :autocomplete="meta.autocomplete"
          :aria-invalid="!!errors.length"
          class="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          @input="handleInput"
          @blur="handleBlur"
        />
        <Spinner v-if="isLoading" class="h-4 w-4 text-muted-foreground" />
      </ComboboxAnchor>

      <ComboboxContent
        class="absolute z-50 mt-1 w-full rounded-lg border bg-popover shadow-md outline-none will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=bottom]:animate-slideUpAndFade"
      >
        <ComboboxViewport class="max-h-72 overflow-auto p-1">
          <!-- Options -->
          <template v-if="options.length > 0">
            <ComboboxItem
              v-for="option in options"
              :key="option.value"
              :value="option"
              class="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 pr-8 text-sm outline-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
            >
              <ComboboxItemIndicator
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
          <div
            v-else-if="searchValue.trim().length >= minQueryLength"
            class="py-6 text-center text-sm text-muted-foreground"
          >
            {{ notFoundText }}
          </div>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxRoot>
  </FormFieldWrapper>
</template>
