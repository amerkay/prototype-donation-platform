<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Image as ImageIcon } from 'lucide-vue-next'
import { useDropZone, useFileDialog } from '@vueuse/core'
import { cn } from '@/lib/utils'
import type {
  FieldProps,
  FieldEmits,
  ImageUploadFieldDef
} from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | null, ImageUploadFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | null>>()

const { wrapperProps, resolvedLabel, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors
)

// Refs
const dropZoneRef = ref<HTMLDivElement>()
const error = ref<string | null>(null)
const isLoading = ref(false)

// Get config values with defaults
const accept = props.meta.accept || 'image/*'
const maxSizeMB = props.meta.maxSizeMB || 5
const recommendedDimensions = props.meta.recommendedDimensions || '1200x675px'

// File dialog
const { open: openFileDialog, onChange } = useFileDialog({
  accept,
  multiple: false
})

// Drop zone
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: handleFiles,
  dataTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
})

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
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    error.value = `File size must be less than ${maxSizeMB}MB`
    return
  }

  isLoading.value = true

  try {
    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
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
  emit('update:modelValue', null)
  error.value = null
}

function replaceImage() {
  openFileDialog()
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <!-- Preview or Upload Zone -->
    <div v-if="modelValue" class="relative max-w-md">
      <Card class="overflow-hidden p-0 gap-y-0">
        <div class="aspect-video bg-muted">
          <img
            :src="modelValue"
            :alt="resolvedLabel || 'Image'"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="flex gap-2 p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            type="button"
            class="flex-1"
            :disabled="resolvedDisabled"
            @click="replaceImage"
          >
            <Upload class="w-3.5 h-3.5 mr-2" />
            Replace
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            class="flex-1"
            :disabled="resolvedDisabled"
            @click="removeImage"
          >
            <X class="w-3.5 h-3.5 mr-2" />
            Remove
          </Button>
        </div>
      </Card>
    </div>

    <div v-else>
      <Card
        ref="dropZoneRef"
        :class="
          cn(
            'border-2 border-dashed transition-colors',
            !resolvedDisabled && 'cursor-pointer',
            resolvedDisabled && 'opacity-50 cursor-not-allowed',
            isOverDropZone && !resolvedDisabled && 'border-primary bg-primary/5',
            error && 'border-destructive'
          )
        "
        @click="!resolvedDisabled && openFileDialog()"
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
              {{ recommendedDimensions ? ` • Recommended: ${recommendedDimensions}` : '' }}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            type="button"
            :disabled="resolvedDisabled"
            @click.stop="openFileDialog"
          >
            <Upload class="w-3.5 h-3.5 mr-2" />
            Choose File
          </Button>
        </div>
      </Card>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-destructive mt-2">{{ error }}</p>

    <!-- Loading State -->
    <p v-if="isLoading" class="text-sm text-muted-foreground mt-2">Processing image...</p>
  </FormFieldWrapper>
</template>
