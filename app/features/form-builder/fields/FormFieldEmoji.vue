<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import type { EmojiFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import { useResolvedFieldMeta } from '~/features/form-builder/composables/useResolvedFieldMeta'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import EmojiPicker from '../components/EmojiPicker.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: EmojiFieldMeta
  name: string
  onChange?: (value: unknown) => void
}

const props = defineProps<Props>()

const { resolvedLabel, resolvedDescription } = useResolvedFieldMeta(props.meta)

const pickerOpen = ref(false)
const selectedEmoji = computed(() => props.field.value as string | undefined)

const handleEmojiSelect = (emoji: string) => {
  props.field.onChange(emoji)
  // Trigger validation by simulating blur event
  props.field.onBlur?.(new Event('blur'))
  props.onChange?.(emoji)
}

const clearEmoji = () => {
  props.field.onChange('')
  // Trigger validation by simulating blur event
  props.field.onBlur?.(new Event('blur'))
  props.onChange?.('')
}

// Trigger validation on mount to show errors immediately if field is required and empty
onMounted(() => {
  props.field.onBlur?.(new Event('blur'))
})
</script>

<template>
  <FormFieldWrapper
    :name="name"
    :label="resolvedLabel"
    :description="resolvedDescription"
    :optional="meta.optional"
    :errors="errors"
    :invalid="!!errors.length"
    :label-class="meta.labelClass"
    :description-class="meta.descriptionClass"
  >
    <div class="flex items-center gap-2">
      <EmojiPicker
        v-model:open="pickerOpen"
        :disabled="meta.disabled"
        :class="meta.class"
        :selected-value="selectedEmoji"
        :hide-trigger="!!selectedEmoji"
        @select="handleEmojiSelect"
      />

      <div v-if="selectedEmoji" class="flex items-center gap-2 flex-1">
        <Button
          variant="outline"
          class="text-2xl h-10 px-3"
          aria-label="Change emoji"
          @click="pickerOpen = true"
        >
          {{ selectedEmoji }}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="h-10 w-10"
          aria-label="Clear emoji"
          @click="clearEmoji"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </FormFieldWrapper>
</template>
