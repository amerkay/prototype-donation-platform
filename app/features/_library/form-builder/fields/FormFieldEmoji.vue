<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import type { FieldProps, FieldEmits, EmojiFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'
import EmojiPicker from '../components/EmojiPicker.vue'

type Props = FieldProps<string, EmojiFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string>>()

const { wrapperProps, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

const pickerOpen = ref(false)
const selectedEmoji = computed(() => props.modelValue)

const handleEmojiSelect = (emoji: string) => {
  emit('update:modelValue', emoji)
  // Trigger validation by calling onBlur if provided
  props.onBlur?.(new Event('blur'))
}

// Trigger validation on mount to show errors immediately if field is required and empty
onMounted(() => {
  props.onBlur?.(new Event('blur'))
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <div class="flex items-center gap-2">
      <EmojiPicker
        v-model:open="pickerOpen"
        :disabled="resolvedDisabled"
        :class="meta.class"
        :selected-value="selectedEmoji"
        :hide-trigger="!!selectedEmoji"
        @select="handleEmojiSelect"
      />

      <div v-if="selectedEmoji" class="flex items-center gap-2 flex-1">
        <Button type="button" variant="outline" size="lg" @click="pickerOpen = true">
          <span class="text-2xl">{{ selectedEmoji }}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          @click="
            () => {
              $emit('update:modelValue', '')
              onBlur?.()
            }
          "
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </FormFieldWrapper>
</template>
