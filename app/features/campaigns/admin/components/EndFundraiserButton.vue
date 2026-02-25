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
import { ICON_TERMINAL_STOP } from '~/lib/icons'

defineProps<{
  name: string
}>()

const emit = defineEmits<{ confirm: [] }>()

const showDialog = ref(false)

function handleConfirm() {
  showDialog.value = false
  emit('confirm')
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    class="text-destructive hover:text-destructive"
    title="End Fundraiser"
    @click="showDialog = true"
  >
    <ICON_TERMINAL_STOP class="size-4" />
  </Button>

  <AlertDialog v-model:open="showDialog">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>End Fundraiser?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently end <strong>{{ name }}</strong
          >. Donors will no longer be able to donate. This cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button variant="destructive" @click="handleConfirm">End Fundraiser</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
