<script setup lang="ts">
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
import CurrencyConversionBreakdown from './CurrencyConversionBreakdown.vue'
import type { ConversionBreakdown } from '~/features/donation-form/shared/composables/useCurrency'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    fromCurrency: string
    toCurrency: string
    breakdown: ConversionBreakdown | null
    examples?: Array<{ label: string; from: string; to: string }>
    confirmLabel?: string
    skipLabel?: string
    cancelLabel?: string
  }>(),
  {
    examples: () => [],
    confirmLabel: 'Convert',
    skipLabel: 'Keep Current Values',
    cancelLabel: undefined
  }
)

defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  skip: []
  cancel: []
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="$emit('update:open', $event)">
    <AlertDialogContent class="max-w-lg">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription as="div" class="space-y-4">
          <p>
            <slot name="description">
              {{ description }}
            </slot>
          </p>

          <slot name="extra-content" />

          <CurrencyConversionBreakdown
            v-if="breakdown"
            :breakdown="breakdown"
            :from-currency="fromCurrency"
            :to-currency="toCurrency"
          />

          <div v-if="examples.length > 0" class="text-sm space-y-1">
            <p class="font-medium">Affected prices:</p>
            <p v-for="ex in examples" :key="ex.label" class="text-muted-foreground">
              {{ ex.label }}: {{ ex.from }} → {{ ex.to }}
            </p>
          </div>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button v-if="cancelLabel" variant="outline" @click="$emit('cancel')">
          {{ cancelLabel }}
        </Button>
        <AlertDialogCancel @click="$emit('skip')">{{ skipLabel }}</AlertDialogCancel>
        <AlertDialogAction @click="$emit('confirm')">{{ confirmLabel }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
