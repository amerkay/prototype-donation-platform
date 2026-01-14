<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Upload, X, Image as ImageIcon } from 'lucide-vue-next'
import { useDropZone, useFileDialog } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
    description?: string
    accept?: string
    maxSizeMB?: number
  }>(),
  {
    label: 'Cover Photo',
    description: 'Upload a campaign cover image (recommended: 1200x675px)',
    accept: 'image/*',
    maxSizeMB: 5
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

// Refs
const dropZoneRef = ref<HTMLDivElement>()
const previewUrl = ref<string | null>(props.modelValue || null)
const error = ref<string | null>(null)
const isLoading = ref(false)

// File dialog
const { open: openFileDialog, onChange } = useFileDialog({
  accept: props.accept,
  multiple: false
})

// Drop zone
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleFiles,
  dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
})

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    previewUrl.value = newValue || null
  }
)

// Handle file selection
onChange((files) => {
  if (files && files.length > 0) {
    handleFiles(files)
  }
})

async function handleFiles(files: File[] | FileList | null) {
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file) return

  error.value = null

  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please upload an image file'
    return
  }

  // Validate file size
  const maxSizeBytes = props.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    error.value = `File size must be less than ${props.maxSizeMB}MB`
    return
  }

  isLoading.value = true

  try {
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      previewUrl.value = result
      emit('update:modelValue', result)
      isLoading.value = false
    }
    reader.onerror = () => {
      error.value = 'Failed to read file'
      isLoading.value = false
    }
    reader.readAsDataURL(file)
  } catch {
    error.value = 'Failed to process image'
    isLoading.value = false
  }
}

function removeImage() {
  previewUrl.value = null
  emit('update:modelValue', null)
  error.value = null
}

function replaceImage() {
  openFileDialog()
}
</script>

<template>
  <div class="space-y-2">
    <!-- Label -->
    <Label v-if="label">{{ label }}</Label>
    <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>

    <!-- Preview or Upload Zone -->
    <div v-if="previewUrl" class="relative max-w-md">
      <Card class="overflow-hidden">
        <div class="relative aspect-video bg-muted">
          <img :src="previewUrl" :alt="label" class="w-full h-full object-cover" />
          <div
            class="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100"
          >
            <Button variant="secondary" size="sm" @click="replaceImage">
              <Upload class="w-3.5 h-3.5 mr-2" />
              Replace
            </Button>
            <Button variant="secondary" size="sm" @click="removeImage">
              <X class="w-3.5 h-3.5 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <div v-else>
      <Card
        ref="dropZoneRef"
        :class="
          cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isOverDropZone && 'border-primary bg-primary/5',
            error && 'border-destructive'
          )
        "
        @click="openFileDialog"
      >
        <div class="p-4 flex flex-col items-center justify-center text-center space-y-2">
          <div
            :class="
              cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isOverDropZone ? 'bg-primary/20' : 'bg-muted'
              )
            "
          >
            <ImageIcon
              :class="cn('w-5 h-5', isOverDropZone ? 'text-primary' : 'text-muted-foreground')"
            />
          </div>

          <div class="space-y-1">
            <p class="text-sm font-medium">
              {{ isOverDropZone ? 'Drop image here' : 'Click to upload or drag and drop' }}
            </p>
            <p class="text-xs text-muted-foreground">
              PNG, JPG, WebP or GIF (max {{ maxSizeMB }}MB)
            </p>
          </div>

          <Button variant="outline" size="sm" type="button" @click.stop="openFileDialog">
            <Upload class="w-3.5 h-3.5 mr-2" />
            Choose File
          </Button>
        </div>
      </Card>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>

    <!-- Loading State -->
    <p v-if="isLoading" class="text-sm text-muted-foreground">Processing image...</p>
  </div>
</template>
