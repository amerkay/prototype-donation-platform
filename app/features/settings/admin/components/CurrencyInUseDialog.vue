<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { AffectedForm } from '~/features/settings/admin/composables/useCurrencyGuards'

defineProps<{
  open: boolean
  currencies: string[]
  forms: AffectedForm[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  discard: []
  navigate: [href: string]
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent class="sm:max-w-lg" :class="{ '[&>button]:hidden': true }">
      <AlertDialogHeader>
        <AlertDialogTitle class="flex items-center gap-2.5">
          <div
            class="bg-amber-500/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          >
            <AlertTriangle class="h-4 w-4 text-amber-500" />
          </div>
          Cannot Remove Currency
        </AlertDialogTitle>
        <AlertDialogDescription>
          <strong>{{ currencies.join(', ') }}</strong>
          {{ currencies.length === 1 ? 'is' : 'are' }} the default currency on {{ forms.length }}
          {{ forms.length === 1 ? 'form' : 'forms' }}. Change the default currency on each form
          first, then try again.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div class="max-h-48 space-y-2 overflow-y-auto">
        <div
          v-for="(form, i) in forms"
          :key="i"
          class="bg-muted flex items-center justify-between gap-2 rounded-md p-3 text-sm"
        >
          <span>{{ form.campaignName }} › {{ form.formName }}</span>
          <Button variant="outline" size="sm" class="shrink-0" @click="emit('navigate', form.href)">
            View Form
          </Button>
        </div>
      </div>

      <AlertDialogFooter>
        <Button variant="outline" @click="emit('discard')">Discard Changes</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
