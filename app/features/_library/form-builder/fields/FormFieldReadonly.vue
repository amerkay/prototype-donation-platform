<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ReadonlyFieldDef, FieldProps } from '~/features/_library/form-builder/types'
import { useFieldWrapper } from '~/features/_library/form-builder/composables/useFieldWrapper'
import FormFieldWrapper from '~/features/_library/form-builder/internal/FormFieldWrapper.vue'

type Props = FieldProps<unknown, ReadonlyFieldDef>

const props = defineProps<Props>()

const { wrapperProps } = useFieldWrapper(
  props.meta,
  props.name,
  () => props.errors,
  {
    disableLabelFor: true,
    orientation: props.meta.variant === 'badge' ? 'horizontal' : undefined
  },
  () => props.fullPath
)

const displayText = computed(() => {
  if (props.meta.formatValue) return props.meta.formatValue(props.modelValue)
  return String(props.modelValue ?? '')
})
</script>

<template>
  <FormFieldWrapper
    v-bind="wrapperProps"
    :class="cn(meta.variant === 'badge' && 'w-fit!', props.class)"
  >
    <Badge v-if="meta.variant === 'badge'" variant="outline" class="w-fit! cursor-default">
      {{ displayText }}
    </Badge>
    <span v-else class="text-sm text-muted-foreground">{{ displayText }}</span>
  </FormFieldWrapper>
</template>
