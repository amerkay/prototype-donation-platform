<script setup lang="ts">
import type { FieldProps, FieldEmits, HiddenFieldDef } from '~/features/_library/form-builder/types'

type Props = FieldProps<string, HiddenFieldDef>

defineProps<Props>()
defineEmits<FieldEmits<string | undefined>>()
</script>

<template>
  <input
    :id="id || name"
    :name="name"
    type="hidden"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
