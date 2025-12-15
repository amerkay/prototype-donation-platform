<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import type { SelectFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: SelectFieldMeta
  name: string
}

const props = defineProps<Props>()

const open = ref(false)

function selectOption(value: string | number | bigint | Record<string, unknown>) {
  if (typeof value === 'string' || typeof value === 'number') {
    props.field.onChange(value === props.field.value ? '' : value)
    open.value = false
  }
}

function getLabel(value: string | number) {
  const option = props.meta.options.find((o) => o.value === value)
  return option?.label || props.meta.placeholder || 'Select...'
}
</script>

<template>
  <Field :data-invalid="!!errors.length">
    <FieldLabel v-if="meta.label" :for="name">
      {{ meta.label }}
      <span v-if="meta.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          :aria-invalid="!!errors.length"
          class="w-full justify-between font-normal"
        >
          <span :class="field.value ? '' : 'text-muted-foreground'">
            {{ getLabel(field.value as string | number) }}
          </span>
          <ChevronsUpDownIcon class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="w-full p-0" align="start">
        <Command>
          <CommandInput
            v-if="meta.searchPlaceholder"
            class="h-9"
            :placeholder="meta.searchPlaceholder"
          />
          <CommandList>
            <CommandEmpty>{{ meta.notFoundText || 'No options found.' }}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                v-for="option in meta.options"
                :key="option.value"
                :value="String(option.value)"
                @select="
                  (ev) => {
                    if (ev.detail.value) selectOption(ev.detail.value)
                  }
                "
              >
                {{ option.label }}
                <CheckIcon
                  :class="
                    cn(
                      'ml-auto h-4 w-4',
                      field.value === option.value ? 'opacity-100' : 'opacity-0'
                    )
                  "
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
    <FieldError v-if="errors.length" :errors="errors" />
  </Field>
</template>
