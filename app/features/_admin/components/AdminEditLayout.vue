<script setup lang="ts">
import { inject } from 'vue'
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
import { ExternalLink, Pencil } from 'lucide-vue-next'
import { LEAVE_GUARD_KEY, type LeaveGuard } from '~/features/_admin/composables/useAdminEdit'

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
  /** Allow editing the last breadcrumb item */
  editableLastItem?: boolean
  /** Maximum length for editable last item */
  maxLength?: number
  /** Toggle preview editable mode (v-model:editable) */
  editable?: boolean
}

interface Emits {
  (e: 'preview' | 'confirmDiscard'): void
  (e: 'update:showDiscardDialog' | 'update:editable', value: boolean): void
  (e: 'update:lastItemLabel', value: string): void
}

withDefaults(defineProps<Props>(), {
  isDirty: false,
  showPreview: true,
  previewLabel: 'Preview',
  showDiscardDialog: false,
  editableLastItem: false,
  editable: undefined
})

const emit = defineEmits<Emits>()

// Inject leave guard from useAdminEdit (provided in parent page)
const leaveGuard = inject<LeaveGuard | null>(LEAVE_GUARD_KEY, null)
</script>

<template>
  <!-- Breadcrumb Bar -->
  <AdminBreadcrumbBar
    :items="breadcrumbs"
    :is-dirty="isDirty"
    :editable-last-item="editableLastItem"
    :max-length="maxLength"
    @update:last-item-label="emit('update:lastItemLabel', $event)"
  />

  <div class="flex flex-1 flex-col">
    <!-- Optional header content (e.g., CampaignHeader) -->
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
          <div class="flex items-center justify-between gap-2 mb-3">
            <p class="text-muted-foreground text-sm font-semibold">
              <slot name="preview-label">Preview</slot>
            </p>
            <div class="flex items-center gap-2">
              <Button
                v-if="editable !== undefined"
                variant="ghost"
                size="sm"
                :class="editable && 'bg-accent'"
                @click="emit('update:editable', !editable)"
              >
                <Pencil class="w-4 h-4" />
                <span v-if="editable">Editing</span>
              </Button>
              <slot name="preview-actions" />
              <Button v-if="showPreview" variant="outline" size="sm" @click="emit('preview')">
                <ExternalLink class="w-4 h-4 mr-2" />
                {{ previewLabel }}
              </Button>
            </div>
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

  <!-- Leave Navigation Guard Dialog -->
  <AlertDialog
    v-if="leaveGuard"
    :open="leaveGuard.showDialog.value"
    @update:open="(v: boolean) => !v && leaveGuard!.resolve('stay')"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved changes that will be lost if you leave this page.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter class="flex-col sm:flex-row gap-2">
        <AlertDialogCancel @click="leaveGuard.resolve('stay')">Stay on page</AlertDialogCancel>
        <Button variant="outline" @click="leaveGuard.resolve('discard')"> Discard & leave </Button>
        <Button :disabled="!leaveGuard.canSave.value" @click="leaveGuard.resolve('save')">
          Save & leave
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
