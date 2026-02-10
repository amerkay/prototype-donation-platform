<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Bold, Italic, Underline, Link, Braces } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import type { RichTextVariable } from '~/features/_library/form-builder/types'

interface Props {
  editor: Editor
  variables?: ReadonlyArray<RichTextVariable>
  disabled?: boolean
}

const props = defineProps<Props>()

const linkUrl = ref('')
const linkOpen = ref(false)

function toggleBold() {
  props.editor.chain().focus().toggleBold().run()
}

function toggleItalic() {
  props.editor.chain().focus().toggleItalic().run()
}

function toggleUnderline() {
  props.editor.chain().focus().toggleUnderline().run()
}

function applyLink() {
  if (linkUrl.value) {
    props.editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.value }).run()
  } else {
    props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
  }
  linkUrl.value = ''
  linkOpen.value = false
}

function insertVariable(id: string) {
  props.editor.chain().focus().insertContent({ type: 'variableNode', attrs: { id } }).run()
}

function variablePreview(value: string) {
  return `{{ ${value} }}`
}
</script>

<template>
  <div
    :class="
      cn(
        'flex items-center gap-0.5 border-b px-1 py-1',
        disabled && 'pointer-events-none opacity-50'
      )
    "
  >
    <!-- Formatting toggles -->
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      :class="cn(editor.isActive('bold') && 'bg-accent')"
      :disabled="disabled"
      @click="toggleBold"
    >
      <Bold class="size-4" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      :class="cn(editor.isActive('italic') && 'bg-accent')"
      :disabled="disabled"
      @click="toggleItalic"
    >
      <Italic class="size-4" />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      :class="cn(editor.isActive('underline') && 'bg-accent')"
      :disabled="disabled"
      @click="toggleUnderline"
    >
      <Underline class="size-4" />
    </Button>

    <Separator orientation="vertical" class="mx-1 h-5" />

    <!-- Link popover -->
    <Popover v-model:open="linkOpen">
      <PopoverTrigger as-child>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          :class="cn(editor.isActive('link') && 'bg-accent')"
          :disabled="disabled"
        >
          <Link class="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-72 p-3" align="start">
        <form class="flex gap-2" @submit.prevent="applyLink">
          <Input v-model="linkUrl" placeholder="https://example.com" class="flex-1 text-sm" />
          <Button type="submit" size="sm">Apply</Button>
        </form>
      </PopoverContent>
    </Popover>

    <!-- Variable dropdown -->
    <template v-if="variables?.length">
      <Separator orientation="vertical" class="mx-1 h-5" />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button type="button" variant="ghost" size="icon-sm" :disabled="disabled">
            <Braces class="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem v-for="v in variables" :key="v.value" @click="insertVariable(v.value)">
            <span>{{ v.label }}</span>
            <span
              class="ml-auto text-xs text-muted-foreground font-mono"
              v-text="variablePreview(v.value)"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </template>
  </div>
</template>
