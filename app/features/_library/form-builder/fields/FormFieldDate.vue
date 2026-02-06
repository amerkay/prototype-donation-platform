<script setup lang="ts">
import { computed } from 'vue'
import { CalendarDate, type DateValue, getLocalTimeZone, today } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CalendarIcon, X } from 'lucide-vue-next'
import { format, parseISO } from 'date-fns'
import type { FieldProps, FieldEmits, DateFieldDef } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | null, DateFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | null>>()

const { wrapperProps, resolvedDisabled } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

const defaultPlaceholder = today(getLocalTimeZone())

/** Convert ISO date string ('2026-03-15') → CalendarDate for the Calendar component */
function toCalendarDate(iso: string): CalendarDate {
  const parts = iso.split('-').map(Number) as [number, number, number]
  return new CalendarDate(parts[0], parts[1], parts[2])
}

const calendarValue = computed<DateValue | undefined>({
  get() {
    if (!props.modelValue) return undefined
    return toCalendarDate(props.modelValue)
  },
  set(val: DateValue | undefined) {
    if (!val) {
      emit('update:modelValue', null)
      return
    }
    const date = val.toDate(getLocalTimeZone())
    emit('update:modelValue', format(date, 'yyyy-MM-dd'))
  }
})

const displayText = computed(() => {
  if (!props.modelValue) return undefined
  return format(parseISO(props.modelValue), 'PPP')
})

const minValue = computed<DateValue | undefined>(() =>
  props.meta.minDate ? toCalendarDate(props.meta.minDate) : undefined
)

const maxValue = computed<DateValue | undefined>(() =>
  props.meta.maxDate ? toCalendarDate(props.meta.maxDate) : undefined
)

const showClear = computed(() => props.modelValue && props.meta.optional && !resolvedDisabled.value)
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <Popover v-slot="{ close }">
      <div class="flex gap-1">
        <PopoverTrigger as-child>
          <Button
            :id="id || name"
            variant="outline"
            :disabled="resolvedDisabled"
            :aria-invalid="!!errors.length"
            :class="
              cn(
                'flex-1 min-w-0 justify-start text-left font-normal',
                !modelValue && 'text-muted-foreground'
              )
            "
          >
            <CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
            <span class="truncate">{{ displayText || 'Pick a date' }}</span>
          </Button>
        </PopoverTrigger>
        <Button
          v-if="showClear"
          type="button"
          variant="ghost"
          size="icon"
          class="shrink-0 size-9"
          aria-label="Clear date"
          @click="emit('update:modelValue', null)"
        >
          <X class="h-4 w-4" />
        </Button>
      </div>
      <PopoverContent class="w-auto p-0" align="start">
        <Calendar
          v-model="calendarValue"
          :default-placeholder="defaultPlaceholder"
          :min-value="minValue"
          :max-value="maxValue"
          layout="month-and-year"
          initial-focus
          @update:model-value="close"
        />
      </PopoverContent>
    </Popover>
  </FormFieldWrapper>
</template>
