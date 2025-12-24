<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import type { EmojiFieldMeta } from '~/features/form-builder/form-builder-types'
import { useFieldWrapper } from '~/features/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/form-builder/components/FormFieldWrapper.vue'
import EmojiPicker from '../components/EmojiPicker.vue'

interface Props {
  modelValue?: string
  errors: string[]
  meta: EmojiFieldMeta
  name: string
  onBlur?: (e?: Event) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { wrapperProps } = useFieldWrapper(props.meta, props.name, () => props.errors)

const pickerOpen = ref(false)
const selectedEmoji = computed(() => props.modelValue)

const handleEmojiSelect = (emoji: string) => {
  emit('update:modelValue', emoji)
  // Trigger validation by calling onBlur if provided
  props.onBlur?.(new Event('blur'))
}

const clearEmoji = () => {
  emit('update:modelValue', '')
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
