<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Pencil } from 'lucide-vue-next'

defineProps<{
  modelValue: string
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
  if (trimmed) {
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
      @keydown="onKeydown"
      @blur="submitEdit"
    />
    <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" @mousedown.prevent="submitEdit">
      <Check class="h-4 w-4" />
    </Button>
  </div>

  <!-- Display mode -->
  <button
    v-else
    class="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 -mx-1.5 text-sm font-medium text-foreground hover:bg-muted transition-colors group cursor-pointer"
    @click="startEditing(modelValue)"
  >
    <span class="truncate max-w-48 sm:max-w-72">{{ modelValue }}</span>
    <Pencil
      class="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
    />
  </button>
</template>
