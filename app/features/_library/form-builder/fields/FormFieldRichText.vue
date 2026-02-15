<script setup lang="ts">
import { watch, toValue } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { cn } from '@/lib/utils'
import type {
  FieldProps,
  FieldEmits,
  RichTextFieldDef
} from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'
import { VariableNode } from '../components/rich-text/variable-node'
import RichTextToolbar from '../components/rich-text/RichTextToolbar.vue'

type Props = FieldProps<string, RichTextFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string>>()

const { wrapperProps, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  { disableLabelFor: true },
  () => props.fullPath
)

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
      blockquote: false,
      codeBlock: false,
      code: false,
      horizontalRule: false
    }),
    Underline,
    Link.configure({ openOnClick: false }),
    VariableNode
  ],
  editable: !resolvedDisabled.value,
  onUpdate: ({ editor: e }) => {
    const html = e.getHTML()
    emit('update:modelValue', html === '<p></p>' ? '' : html)
  }
})

// Sync external value changes (e.g., form reset)
watch(
  () => props.modelValue,
  (val) => {
    if (!editor.value) return
    const current = editor.value.getHTML()
    const normalized = val || ''
    if (current !== normalized) {
      editor.value.commands.setContent(normalized, { emitUpdate: false })
    }
  }
)

// Sync disabled state
watch(resolvedDisabled, (disabled) => {
  editor.value?.setEditable(!disabled)
})
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <div
      v-if="editor"
      :class="
        cn(
          'rounded-md border bg-background shadow-xs transition-colors',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          resolvedDisabled && 'opacity-50 cursor-not-allowed',
          errors.length && 'border-destructive'
        )
      "
    >
      <RichTextToolbar
        :editor="editor"
        :variables="toValue(meta.variables)"
        :disabled="resolvedDisabled"
      />
      <EditorContent
        :editor="editor"
        :class="cn('rich-text-editor', resolvedDisabled && 'pointer-events-none')"
      />
    </div>
  </FormFieldWrapper>
</template>

<style scoped>
.rich-text-editor :deep(.tiptap) {
  padding: 0.5rem 0.75rem;
  min-height: 5rem;
  outline: none;
}

.rich-text-editor :deep(.tiptap p) {
  margin: 0;
}

.rich-text-editor :deep(.tiptap p + p) {
  margin-top: 0.5em;
}

.rich-text-editor :deep(.tiptap a) {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.rich-text-editor :deep(.tiptap span[data-variable]) {
  display: inline-flex;
  align-items: center;
  background-color: var(--color-primary-foreground);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  padding: 0 0.375rem;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.8em;
  line-height: 1.5;
  white-space: nowrap;
  user-select: all;
}
</style>
