<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Pencil, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  /** Override display text classes (default: 'text-sm font-medium') */
  displayClass?: string
  /** Maximum length for the input */
  maxLength?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isEditing = ref(false)
const editValue = ref('')
const inputRef = ref<InstanceType<typeof Input> | null>(null)

function startEditing(currentValue: string) {
  editValue.value = currentValue
  isEditing.value = true
  nextTick(() => {
    const el = inputRef.value?.$el as HTMLInputElement | undefined
    el?.focus()
    el?.select()
  })
}

function submitEdit() {
  const trimmed = editValue.value.trim()
  if (trimmed && trimmed !== props.modelValue) {
    emit('update:modelValue', trimmed)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    submitEdit()
  } else if (e.key === 'Escape') {
    cancelEdit()
  }
}
</script>

<template>
  <!-- Editing mode -->
  <div v-if="isEditing" class="flex items-center gap-1">
    <Input
      ref="inputRef"
      v-model="editValue"
      class="h-7 text-sm min-w-40 max-w-64"
      :maxlength="maxLength"
      @keydown="onKeydown"
      @blur="submitEdit"
    />
    <Button
      variant="ghost"
      size="icon"
      class="ml-1 h-7 w-7 shrink-0"
      @mousedown.prevent="submitEdit"
    >
      <Check class="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @mousedown.prevent="cancelEdit">
      <X class="h-4 w-4" />
    </Button>
  </div>

  <!-- Display mode -->
  <button
    v-else
    :class="
      cn(
        'inline-flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 text-foreground hover:bg-muted transition-colors group cursor-pointer',
        props.displayClass || 'text-sm font-medium'
      )
    "
    @click="startEditing(modelValue)"
  >
    <span class="truncate">{{ modelValue }}</span>
    <Pencil
      class="h-3 w-3 shrink-0 text-muted-foreground md:opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </button>
</template>
