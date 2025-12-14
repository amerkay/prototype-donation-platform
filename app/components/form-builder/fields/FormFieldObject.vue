<script setup lang="ts">
import { FieldSet, FieldLegend, FieldDescription, FieldGroup } from '@/components/ui/field'
import type { ObjectFieldMeta } from '@/lib/form-builder/types'
import type { VeeFieldContext } from '@/lib/form-builder/field-types'
import FormField from '../FormField.vue'

interface Props {
  field: VeeFieldContext
  errors: string[]
  meta: ObjectFieldMeta
  name: string
}

defineProps<Props>()
</script>

<template>
  <FieldSet :class="['gap-4', meta.class, { 'border p-4 rounded-lg': meta.showBorder }]">
    <FieldLegend v-if="meta.legend || meta.label">{{ meta.legend || meta.label }}</FieldLegend>
    <FieldDescription v-if="meta.description">{{ meta.description }}</FieldDescription>
    <FieldGroup class="gap-4">
      <FormField
        v-for="(fieldMeta, fieldKey) in meta.fields"
        :key="fieldKey"
        :name="`${name}.${fieldKey}`"
        :meta="fieldMeta"
      />
    </FieldGroup>
  </FieldSet>
</template>
