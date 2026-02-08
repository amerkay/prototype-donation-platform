<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

defineProps<{
  open: boolean
  title?: string
  activeCount?: number
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  apply: []
  reset: []
}>()
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="right" class="flex flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle class="flex items-center gap-2">
          {{ title ?? 'Filters' }}
          <Badge v-if="activeCount" variant="secondary" class="text-xs">
            {{ activeCount }}
          </Badge>
        </SheetTitle>
        <SheetDescription>Narrow down results using the filters below.</SheetDescription>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-1 py-4">
        <slot />
      </div>

      <SheetFooter class="flex-row gap-2 border-t pt-4">
        <Button variant="outline" class="flex-1" @click="emit('reset')">Reset</Button>
        <Button class="flex-1" @click="emit('apply')">Apply</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
