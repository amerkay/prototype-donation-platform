<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ArrayFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import { useFieldChange } from '~/features/form-builder/composables/useFieldChange'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ArrayFieldMeta
  name: string
  onFieldChange?: (value: unknown, fieldOnChange: (value: unknown) => void) => void
}

const props = defineProps<Props>()

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)
const { handleChange } = useFieldChange(props.field, props.onFieldChange)

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
  handleChange(newItems)
}

function removeItem(index: number) {
  const newItems = items.value.filter((_, i) => i !== index)
  handleChange(newItems)
}
</script>

<template>
  <FormFieldWrapper
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :class="cn(meta.class, 'space-y-3')"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
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
  </FormFieldWrapper>
</template>
