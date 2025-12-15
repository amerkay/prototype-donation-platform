<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Field, FieldContent, FieldLabel, FieldDescription } from '@/components/ui/field'
import type { ToggleFieldMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ToggleFieldMeta
  name: string
}

const props = defineProps<Props>()

const switchValue = computed(() => props.field.value as boolean | undefined)
</script>

<template>
  <Field orientation="horizontal">
    <FieldContent>
      <FieldLabel v-if="meta.label" :for="name" :class="meta.classLabel">
        {{ meta.label }}
      </FieldLabel>
      <FieldDescription v-if="meta.description" :class="meta.classDescription">
        {{ meta.description }}
      </FieldDescription>
    </FieldContent>
    <Switch :id="name" :model-value="switchValue" @update:model-value="field.onChange" />
  </Field>
</template>
