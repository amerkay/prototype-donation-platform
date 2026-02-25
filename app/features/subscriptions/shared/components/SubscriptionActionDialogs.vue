<script setup lang="ts">
import type { Subscription } from '~/features/subscriptions/shared/types'
import { useCampaignFormatters } from '~/features/campaigns/shared/composables/useCampaignFormatters'
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
import BaseDialogOrDrawer from '@/components/BaseDialogOrDrawer.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const props = defineProps<{
  showPauseDialog: boolean
  showCancelDialog: boolean
  changeAmountState: { open: boolean; newAmount: string; minAmount: number }
  currentSubscription: Subscription | null | undefined
}>()

const emit = defineEmits<{
  'update:showPauseDialog': [value: boolean]
  'update:showCancelDialog': [value: boolean]
  'update:changeAmountState': [value: { open: boolean; newAmount: string; minAmount: number }]
  pause: []
  cancel: []
  changeAmount: []
}>()

const { formatDate } = useCampaignFormatters()

const pauseOpen = computed({
  get: () => props.showPauseDialog,
  set: (v) => emit('update:showPauseDialog', v)
})

const cancelOpen = computed({
  get: () => props.showCancelDialog,
  set: (v) => emit('update:showCancelDialog', v)
})

const changeOpen = computed({
  get: () => props.changeAmountState.open,
  set: (v) => emit('update:changeAmountState', { ...props.changeAmountState, open: v })
})

const isAmountInvalid = computed(() => {
  if (!props.currentSubscription) return true
  const value = parseFloat(props.changeAmountState.newAmount)
  return value === props.currentSubscription.amount || value < props.changeAmountState.minAmount
})
</script>

<template>
  <!-- Pause Confirmation -->
  <AlertDialog v-model:open="pauseOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Pause subscription?</AlertDialogTitle>
        <AlertDialogDescription>
          Your subscription will be paused and you won't be charged until you resume it. You can
          resume at any time.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction @click="$emit('pause')">Pause Subscription</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Cancel Confirmation -->
  <AlertDialog v-model:open="cancelOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. Your subscription will be cancelled and you won't be charged
          again. You can always start a new subscription later.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Go Back</AlertDialogCancel>
        <AlertDialogAction @click="$emit('cancel')">Cancel Subscription</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <!-- Change Amount Dialog -->
  <BaseDialogOrDrawer v-model:open="changeOpen" size="sm">
    <template #header>Change Subscription Amount</template>
    <template #content>
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <Label for="new-amount">New Amount</Label>
          <div class="flex gap-2 items-center">
            <span class="text-sm text-muted-foreground">{{
              currentSubscription?.currency || '£'
            }}</span>
            <Input
              id="new-amount"
              :model-value="changeAmountState.newAmount"
              type="number"
              step="0.01"
              :min="changeAmountState.minAmount"
              placeholder="0.00"
              @update:model-value="
                emit('update:changeAmountState', {
                  ...changeAmountState,
                  newAmount: String($event)
                })
              "
            />
            <span class="text-sm text-muted-foreground whitespace-nowrap"
              >/{{ currentSubscription?.frequency }}</span
            >
          </div>
        </div>
        <p v-if="changeAmountState.minAmount > 1" class="text-xs text-muted-foreground">
          Minimum amount: {{ currentSubscription?.currency || '£'
          }}{{ changeAmountState.minAmount }}
        </p>
        <p class="text-sm text-muted-foreground">
          The new amount will take effect on your next billing date:
          {{
            currentSubscription?.nextBillingDate
              ? formatDate(currentSubscription.nextBillingDate)
              : 'N/A'
          }}
        </p>
      </div>
    </template>
    <template #footer>
      <Button variant="outline" @click="changeOpen = false">Cancel</Button>
      <Button :disabled="isAmountInvalid" @click="$emit('changeAmount')">Update Amount</Button>
    </template>
  </BaseDialogOrDrawer>
</template>
