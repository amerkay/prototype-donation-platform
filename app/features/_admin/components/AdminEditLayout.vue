<script setup lang="ts">
import AdminBreadcrumbBar, { type BreadcrumbItem } from './AdminBreadcrumbBar.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-vue-next'

interface Props {
  /** Breadcrumb items for navigation */
  breadcrumbs: BreadcrumbItem[]
  /** Show "Unsaved" badge */
  isDirty?: boolean
  /** Show preview button in preview panel */
  showPreview?: boolean
  /** Preview button label */
  previewLabel?: string
  /** Show discard dialog */
  showDiscardDialog?: boolean
}

interface Emits {
  (e: 'preview' | 'confirmDiscard'): void
  (e: 'update:showDiscardDialog', value: boolean): void
}

withDefaults(defineProps<Props>(), {
  isDirty: false,
  showPreview: true,
  previewLabel: 'Preview',
  showDiscardDialog: false
})

const emit = defineEmits<Emits>()
</script>

<template>
  <!-- Breadcrumb Bar -->
  <AdminBreadcrumbBar :items="breadcrumbs" :is-dirty="isDirty" />

  <div class="flex flex-1 flex-col">
    <!-- Optional header content (e.g., CompactCampaignHeader) -->
    <div v-if="$slots.header" class="px-4">
      <slot name="header" />
    </div>

    <!-- Main Content Layout -->
    <div class="flex-1 px-4" :class="$slots.header ? 'pt-4' : 'pt-0'">
      <div class="flex-col flex gap-y-6 lg:gap-x-6 lg:flex-row">
        <!-- Left: Main Content -->
        <div class="grow min-w-0 pb-4">
          <slot name="content" />
        </div>

        <!-- Right: Preview Panel -->
        <div
          v-if="$slots.preview"
          class="w-full sm:mx-auto lg:min-w-95 lg:max-w-95 lg:w-95 lg:sticky lg:top-0 lg:self-start lg:max-h-screen lg:overflow-y-auto pb-4"
        >
          <div class="flex items-center justify-between mb-3">
            <p class="text-muted-foreground text-sm font-semibold">
              <slot name="preview-label">Preview</slot>
            </p>
            <Button v-if="showPreview" variant="outline" size="sm" @click="emit('preview')">
              <Eye class="w-4 h-4 mr-2" />
              {{ previewLabel }}
            </Button>
          </div>
          <slot name="preview" />
        </div>
      </div>
    </div>
  </div>

  <!-- Discard Changes Dialog -->
  <AlertDialog :open="showDiscardDialog" @update:open="emit('update:showDiscardDialog', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved changes. Are you sure you want to discard them? This action cannot be
          undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="emit('confirmDiscard')">Discard Changes</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
