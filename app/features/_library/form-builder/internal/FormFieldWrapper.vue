<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'
import {
  Field,
  FieldSet,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldDescription,
  FieldError
} from '@/components/ui/field'
import { useHashTarget } from '~/features/_library/form-builder/composables/useHashTarget'

interface Props {
  name?: string
  label?: string
  description?: string
  optional?: boolean
  errors?: string[]
  invalid?: boolean
  orientation?: 'horizontal' | 'vertical'
  variant?: 'field' | 'fieldset'
  class?: string
  labelClass?: string
  descriptionClass?: string
  disableLabelFor?: boolean
  /** Full vee-validate path for hash target highlighting */
  fullPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'field'
})

// Hash target highlighting for URL deep-linking
const fullPathComputed = computed(() => props.fullPath || '')
const {
  elementRef: wrapperEl,
  hashHighlightClass,
  fieldId: fieldIdFromHash
} = useHashTarget(fullPathComputed, {
  animate: true
})

// Use fieldId from composable (full relativePath ensures uniqueness)
// Convert null to undefined for HTML id attribute
const fieldId = computed(() => fieldIdFromHash.value || undefined)

// Determine if we should show any errors
const showErrors = computed(() => props.errors && props.errors.length > 0)
</script>

<template>
  <!-- Fieldset variant (for radio groups, etc.) -->
  <FieldSet
    v-if="props.variant === 'fieldset'"
    :id="fieldId"
    ref="wrapperEl"
    :data-invalid="props.invalid"
    :class="cn(hashHighlightClass, props.class)"
  >
    <FieldLegend v-if="props.label" :class="props.labelClass">
      {{ props.label }}
      <span v-if="props.optional" class="text-muted-foreground font-normal">(optional)</span>
    </FieldLegend>

    <FieldDescription v-if="props.description" :class="props.descriptionClass">
      {{ props.description }}
    </FieldDescription>

    <slot />

    <FieldError v-if="showErrors" :errors="props.errors!.slice(0, 1)" />
  </FieldSet>

  <!-- Horizontal orientation -->
  <div
    v-else-if="props.orientation === 'horizontal'"
    :id="fieldId"
    ref="wrapperEl"
    :class="cn('flex flex-col gap-1.5', hashHighlightClass, props.class)"
  >
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

    <FieldError v-if="showErrors" :errors="props.errors!.slice(0, 1)" />
  </div>

  <!-- Default vertical orientation -->
  <Field
    v-else
    :id="fieldId"
    ref="wrapperEl"
    :data-invalid="props.invalid"
    :orientation="props.orientation"
    :class="cn(hashHighlightClass, props.class)"
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

    <FieldError v-if="showErrors" class="mb-1" :errors="props.errors!.slice(0, 1)" />
  </Field>
</template>

<style>
@keyframes hash-highlight-pulse {
  50% {
    --tw-ring-color: transparent;
  }
}
.hash-highlight-flash {
  animation: hash-highlight-pulse 500ms ease-in-out 3;
}
</style>
