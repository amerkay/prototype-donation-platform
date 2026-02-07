<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon, X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

// Use `any` for model to avoid Nuxt type inference propagating RangeCalendar's wider emit type.
// Consumers pass DateRange; the component is transparent but types can't flow through cleanly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = defineModel<any>({ required: true })

const range = computed(() => model.value as DateRange)

const formatTriggerDate = (date: { day: number; month: number; year: number }): string =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(date.year, date.month - 1, date.day)
  )

const hasRange = computed(() => range.value.start && range.value.end)

const triggerLabel = computed(() => {
  if (!range.value.start || !range.value.end) return 'Filter by date'
  return `${formatTriggerDate(range.value.start)} – ${formatTriggerDate(range.value.end)}`
})

function clear() {
  model.value = { start: undefined, end: undefined }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          size="sm"
          :class="cn('justify-start text-left font-normal', !hasRange && 'text-muted-foreground')"
        >
          <CalendarIcon class="mr-2 h-4 w-4" />
          {{ triggerLabel }}
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-auto p-0" align="start">
        <RangeCalendar
          :model-value="model"
          :number-of-months="2"
          @update:model-value="model = $event"
        />
      </PopoverContent>
    </Popover>
    <Button v-if="hasRange" variant="ghost" size="icon" class="h-8 w-8" @click="clear">
      <X class="h-4 w-4" />
    </Button>
  </div>
</template>
