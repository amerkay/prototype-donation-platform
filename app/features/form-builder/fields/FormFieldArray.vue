<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import type { ArrayFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ArrayFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const items = computed(() => {
  const value = props.field.value as unknown[] | undefined
  return Array.isArray(value) ? value : []
})

function addItem() {
  const newItems = [...items.value]

  // Initialize new item based on itemField type
  let defaultValue: unknown
  if (props.meta.itemField.type === 'field-group') {
    // Initialize nested object with empty values
    defaultValue = {}
  } else if (props.meta.itemField.type === 'number') {
    defaultValue = undefined
  } else {
    defaultValue = ''
  }

  newItems.push(defaultValue)
  if (props.onFieldChange) {
    props.onFieldChange(newItems, props.field.onChange)
  } else {
    props.field.onChange(newItems)
  }
}

function removeItem(index: number) {
  const newItems = items.value.filter((_, i) => i !== index)
  if (props.onFieldChange) {
    props.onFieldChange(newItems, props.field.onChange)
  } else {
    props.field.onChange(newItems)
  }
}
</script>

<template>
  <Field :data-invalid="!!errors.length" :class="[meta.class, 'space-y-3']">
    <FieldLabel v-if="meta.label" :class="meta.labelClass">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <FieldDescription v-if="meta.description">
      {{ meta.description }}
    </FieldDescription>

    <div class="space-y-3">
      <!-- Array items -->
      <div
        v-for="(_, index) in items"
        :key="index"
        class="relative rounded-lg border bg-card p-2 transition-colors hover:bg-accent/5"
      >
        <div class="flex gap-4">
          <div class="flex-1 min-w-0">
            <FormField :name="`${name}.${index}`" :meta="meta.itemField" />
          </div>
          <div class="flex items-start pt-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              :aria-label="meta.removeButtonText || 'Remove item'"
              @click="removeItem(index)"
            >
              <Icon name="lucide:x" class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Add button -->
      <Button type="button" variant="outline" size="sm" class="w-full gap-2" @click="addItem">
        <Icon name="lucide:plus" class="h-4 w-4" />
        {{ meta.addButtonText || 'Add Item' }}
      </Button>
    </div>

    <FieldError v-if="errors.length" :errors="errors.slice(0, 1)" />
  </Field>
</template>
