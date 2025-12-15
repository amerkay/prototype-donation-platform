<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '@/components/ui/switch'
import { Field, FieldContent, FieldTitle, FieldDescription } from '@/components/ui/field'
import type { ToggleFieldMeta } from '@/lib/form-builder/types'
import type { VeeFieldContext } from '@/lib/form-builder/field-types'

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
      <FieldTitle v-if="meta.label">{{ meta.label }}</FieldTitle>
      <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    </FieldContent>
    <Switch :id="name" :model-value="switchValue" @update:model-value="field.onChange" />
  </Field>
</template>
