<script setup lang="ts" generic="T extends z.ZodTypeAny">
import { computed, watch, provide } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import type * as z from 'zod'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronRightIcon } from 'lucide-vue-next'
import FormField from './FormField.vue'
import type { ConfigSectionDef } from '@/lib/form-builder/types'

interface Props {
  section: ConfigSectionDef<T>
  modelValue: z.infer<T>
  open?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: z.infer<T>]
  'update:open': [value: boolean]
}>()

// Setup form with validation
const { values, setValues, meta, setFieldValue } = useForm({
  validationSchema: toTypedSchema(props.section.schema),
  initialValues: props.modelValue,
  validateOnMount: false
})

// Provide form values to child fields for conditional visibility
provide('formValues', () => values as Record<string, unknown>)

// Provide setFieldValue for child components
provide('setFieldValue', setFieldValue)

// Provide submit handler for Enter key (no-op for config sections)
provide('submitForm', () => {})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    setValues(newValue)
  },
  { deep: true }
)

// Emit changes
watch(
  values,
  (newValues: Record<string, unknown>) => {
    emit('update:modelValue', newValues as z.infer<T>)
  },
  { deep: true }
)

const isOpen = computed({
  get: () => props.open ?? false,
  set: (value) => emit('update:open', value)
})

// Compute validation status for visual feedback
const hasErrors = computed(() => !meta.value.valid && meta.value.touched)
</script>

<template>
  <Collapsible v-model:open="isOpen" class="border rounded-lg">
    <CollapsibleTrigger as-child>
      <Button
        variant="ghost"
        class="w-full justify-between p-4 h-auto hover:bg-accent"
        :class="{ 'border-l-4 border-l-destructive': hasErrors }"
      >
        <div class="text-left flex-1 min-w-0 pr-4">
          <div class="font-semibold">{{ section.title }}</div>
          <div
            v-if="section.description"
            class="text-sm text-muted-foreground font-normal whitespace-normal"
          >
            {{ section.description }}
          </div>
        </div>
        <ChevronRightIcon
          class="h-5 w-5 shrink-0 transition-transform duration-200"
          :class="{ 'rotate-90': isOpen }"
        />
      </Button>
    </CollapsibleTrigger>
    <CollapsibleContent class="p-4 pt-0 space-y-4">
      <FormField
        v-for="(fieldMeta, fieldKey) in section.fields"
        :key="fieldKey"
        :name="String(fieldKey)"
        :meta="fieldMeta"
      />
    </CollapsibleContent>
  </Collapsible>
</template>
