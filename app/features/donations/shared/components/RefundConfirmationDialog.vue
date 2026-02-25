<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ICON_REFUND } from '~/lib/icons'

defineProps<{
  canRefund: boolean
  formattedAmount: string
  showCancelSubscription?: boolean
  alsoCancel: boolean
}>()

defineEmits<{
  'update:alsoCancel': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <AlertDialog v-if="canRefund">
    <AlertDialogTrigger as-child>
      <Button variant="destructive" size="sm">
        <ICON_REFUND class="size-4 mr-1.5" />
        Refund {{ formattedAmount }}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Refund this donation?</AlertDialogTitle>
        <AlertDialogDescription>
          This will reverse the transaction of {{ formattedAmount }}. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div v-if="showCancelSubscription" class="flex items-center gap-2 pt-2">
        <Checkbox
          id="also-cancel-subscription"
          :checked="alsoCancel"
          @update:checked="$emit('update:alsoCancel', $event)"
        />
        <label for="also-cancel-subscription" class="text-sm"> Also cancel the subscription </label>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="$emit('confirm')">Confirm Refund</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
