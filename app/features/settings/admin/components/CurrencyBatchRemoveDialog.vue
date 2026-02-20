<script setup lang="ts">
import { AlertTriangle, ChevronDown } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { AffectedForm } from '~/features/settings/admin/composables/useCurrencyGuards'

defineProps<{
  open: boolean
  currencies: string[]
  forms: AffectedForm[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
  navigate: [href: string]
}>()

const showForms = ref(false)
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
          Remove Currency from Forms
        </AlertDialogTitle>
        <AlertDialogDescription as="div" class="space-y-2">
          <p>
            <strong>{{ currencies.join(', ') }}</strong> is enabled on {{ forms.length }}
            {{ forms.length === 1 ? 'form' : 'forms' }}. Removing
            {{ currencies.length === 1 ? 'it' : 'them' }} means donors on these forms will no longer
            see {{ currencies.join(', ') }} as an option.
          </p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Collapsible v-model:open="showForms">
        <CollapsibleTrigger as-child>
          <Button variant="ghost" size="sm" class="text-muted-foreground gap-1.5 px-0">
            {{ showForms ? 'Hide' : 'Show' }} affected forms ({{ forms.length }})
            <ChevronDown
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-180': showForms }"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="mt-2 max-h-48 space-y-1.5 overflow-y-auto">
            <div
              v-for="(form, i) in forms"
              :key="i"
              class="bg-muted flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm"
            >
              <span class="text-muted-foreground">
                {{ form.campaignName }} › {{ form.formName }}
              </span>
              <Button
                variant="outline"
                size="sm"
                class="shrink-0"
                @click="emit('navigate', form.href)"
              >
                View Form
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialogFooter>
        <Button variant="outline" @click="emit('cancel')">Cancel</Button>
        <Button variant="destructive" @click="emit('confirm')">
          Remove {{ currencies.join(', ') }} from All Forms
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
