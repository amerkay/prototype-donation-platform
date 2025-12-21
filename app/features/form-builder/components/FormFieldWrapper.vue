<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldError
} from '@/components/ui/field'

interface Props {
  name?: string
  label?: string
  description?: string
  optional?: boolean
  errors?: string[]
  invalid?: boolean
  orientation?: 'horizontal' | 'vertical'
  class?: string
  labelClass?: string
  descriptionClass?: string
  disableLabelFor?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <template v-if="props.orientation === 'horizontal'">
    <div :class="cn('flex flex-col gap-1.5', props.class)">
      <Field :data-invalid="props.invalid" :orientation="props.orientation">
        <FieldContent class="min-w-0">
          <FieldLabel
            v-if="props.label"
            :for="props.disableLabelFor ? undefined : props.name"
            :class="cn('mb-0', props.labelClass)"
          >
            {{ props.label }}
            <span v-if="props.optional" class="text-muted-foreground font-normal">(optional)</span>
          </FieldLabel>

          <FieldDescription v-if="props.description" :class="props.descriptionClass">
            {{ props.description }}
          </FieldDescription>
        </FieldContent>

        <slot />
      </Field>

      <FieldError v-if="props.errors?.length" :errors="props.errors.slice(0, 1)" />
    </div>
  </template>

  <Field
    v-else
    :data-invalid="props.invalid"
    :orientation="props.orientation"
    :class="cn(props.class)"
  >
    <FieldLabel
      v-if="props.label"
      :for="props.disableLabelFor ? undefined : props.name"
      :class="cn('mb-0', props.labelClass)"
    >
      {{ props.label }}
      <span v-if="props.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLabel>

    <FieldDescription v-if="props.description" :class="props.descriptionClass">
      {{ props.description }}
    </FieldDescription>

    <slot />

    <FieldError v-if="props.errors?.length" class="mb-1" :errors="props.errors.slice(0, 1)" />
  </Field>
</template>
