<script setup lang="ts">
import { FieldSet, FieldLegend, FieldDescription, FieldGroup } from '@/components/ui/field'
import type { FieldGroupMeta, VeeFieldContext } from '~/features/form-builder/form-builder-types'
import FormField from '../FormField.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: FieldGroupMeta
  name: string
}

defineProps<Props>()
</script>

<template>
  <FieldSet :class="['gap-3', meta.class]">
    <FieldLegend v-if="meta.legend || meta.label">{{ meta.legend || meta.label }}</FieldLegend>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <FieldGroup class="grid grid-cols-3 gap-3">
      <FormField
        v-for="(fieldMeta, fieldKey) in meta.fields"
        :key="fieldKey"
        :name="`${name}.${fieldKey}`"
        :meta="fieldMeta"
      />
    </FieldGroup>
  </FieldSet>
</template>
