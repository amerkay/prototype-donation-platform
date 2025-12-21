<script setup lang="ts">
import { FieldSeparator } from '@/components/ui/field'
import type { SeparatorFieldMeta } from '~/features/form-builder/form-builder-types'

interface Props {
  meta: SeparatorFieldMeta
}

defineProps<Props>()
</script>

<template>
  <FieldSeparator :class="meta.class" />
</template>
