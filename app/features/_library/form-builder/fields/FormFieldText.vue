<script setup lang="ts">
import { ref, toValue } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Braces } from 'lucide-vue-next'
import type { FieldProps, FieldEmits, TextFieldDef } from '~/features/_library/form-builder/types'
import {
  useFieldWrapper,
  preventEnterSubmit
} from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<string | number, TextFieldDef>

const props = defineProps<Props>()
const emit = defineEmits<FieldEmits<string | number | undefined>>()

const { wrapperProps, resolvedPlaceholder, resolvedDisabled, resolvedClass } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {},
  () => props.fullPath
)

const inputRef = ref<InstanceType<typeof Input> | null>(null)
const resolvedVariables = computed(() => toValue(props.meta.variables) ?? [])

function insertVariable(key: string) {
  const el = inputRef.value?.$el as HTMLInputElement | undefined
  const tag = `{{ ${key} }}`
  if (!el) {
    emit('update:modelValue', ((props.modelValue ?? '') + tag) as string)
    return
  }
  const start = el.selectionStart ?? el.value.length
  const end = el.selectionEnd ?? start
  const val = el.value
  const newValue = val.slice(0, start) + tag + val.slice(end)
  emit('update:modelValue', newValue)
  nextTick(() => {
    const pos = start + tag.length
    el.setSelectionRange(pos, pos)
    el.focus()
  })
}
</script>

<template>
  <FormFieldWrapper v-bind="wrapperProps">
    <div :class="cn('relative', resolvedVariables.length ? 'flex items-center' : '')">
      <Input
        :id="id || name"
        ref="inputRef"
        :model-value="modelValue"
        :placeholder="resolvedPlaceholder"
        :autocomplete="meta.autocomplete"
        :maxlength="meta.maxLength"
        :disabled="resolvedDisabled"
        :aria-invalid="!!errors.length"
        :class="
          cn('bg-background', resolvedClass, 'text-sm', resolvedVariables.length ? 'pr-10' : '')
        "
        @update:model-value="$emit('update:modelValue', $event)"
        @blur="onBlur"
        @keydown.enter="preventEnterSubmit"
      />
      <DropdownMenu v-if="resolvedVariables.length">
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            :disabled="resolvedDisabled"
            type="button"
          >
            <Braces class="h-3.5 w-3.5" />
            <span class="sr-only">Insert variable</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-48">
          <DropdownMenuItem
            v-for="v in resolvedVariables"
            :key="v.value"
            @click="insertVariable(v.value)"
          >
            {{ v.label }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </FormFieldWrapper>
</template>
