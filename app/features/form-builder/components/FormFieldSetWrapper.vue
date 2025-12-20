<script setup lang="ts">
import { cn } from '@/lib/utils'
import { FieldSet, FieldLegend, FieldDescription, FieldError } from '@/components/ui/field'

interface Props {
  legend?: string
  description?: string
  optional?: boolean
  errors?: string[]
  invalid?: boolean
  class?: string
  legendClass?: string
  descriptionClass?: string
}

const props = defineProps<Props>()
</script>

<template>
  <FieldSet :data-invalid="props.invalid" :class="cn(props.class)">
    <FieldLegend v-if="props.legend" :class="props.legendClass">
      {{ props.legend }}
      <span v-if="props.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLegend>

    <FieldDescription v-if="props.description" :class="props.descriptionClass">
      {{ props.description }}
    </FieldDescription>

    <slot />

    <FieldError v-if="props.errors?.length" :errors="props.errors.slice(0, 1)" />
  </FieldSet>
</template>
