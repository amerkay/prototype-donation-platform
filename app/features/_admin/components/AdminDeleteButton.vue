<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Trash2 } from 'lucide-vue-next'

defineProps<{
  /** Entity name shown in confirmation, e.g. "New Campaign" */
  entityName?: string
  /** Entity type for dialog title, e.g. "Campaign", "Certificate Template" */
  entityType?: string
  /** Disable the button with a tooltip reason */
  disabled?: boolean
  disabledReason?: string
}>()

const emit = defineEmits<{ deleted: [] }>()

const showDialog = ref(false)

function handleConfirm() {
  showDialog.value = false
  emit('deleted')
}
</script>

<template>
  <Popover v-if="disabled">
    <PopoverTrigger as-child>
      <span class="inline-flex">
        <Button variant="ghost" size="icon" class="pointer-events-none text-destructive opacity-30">
          <Trash2 class="size-4" />
        </Button>
      </span>
    </PopoverTrigger>
    <PopoverContent class="text-xs w-auto">{{ disabledReason }}</PopoverContent>
  </Popover>
  <Button
    v-else
    variant="ghost"
    size="icon"
    class="text-destructive hover:text-destructive"
    @click="showDialog = true"
  >
    <Trash2 class="size-4" />
  </Button>

  <AlertDialog v-model:open="showDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {{ entityType ?? 'Item' }}?</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete
          <template v-if="entityName">"{{ entityName }}"</template>
          <template v-else>this {{ entityType?.toLowerCase() ?? 'item' }}</template
          >? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button variant="destructive" @click="handleConfirm">Delete</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
